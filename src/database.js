const sqlite = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const crypto = require('crypto');

const Database = new sqlite.Database(path.join(process.cwd(), 'database/main.db'));

function run(sqlString, params = []) {
  return new Promise((resolve, reject) => {
    Database.run(sqlString, params, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function query(sqlString, params = []) {
  return new Promise((resolve, reject) => {
    Database.get(sqlString, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function queryAll(sqlString, params = []) {
  return new Promise((resolve, reject) => {
    Database.all(sqlString, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

class Account {
  constructor(accountId) {
    this.id = accountId;
  }

  async init() {
    this._rawAccount = await query('SELECT * FROM accounts WHERE id=?', [this.id]);
    this.displayName = this._rawAccount.displayName;
    this.username = this._rawAccount.username;
    this.password = this._rawAccount.password;
    this.host = this._rawAccount.host;
    return this;
  }
}

class Attendee {
  constructor(attendeeId) {
    this.id = attendeeId;
  }

  async init() {
    this._rawAttendee = await query('SELECT * FROM attendees WHERE id=?', [this.id]);
    this.presence = this._rawAttendee.presence;
    this.account = await this.getAccount();
    return this;
  }

  async getAccount() {
    return (new Account(this._rawAttendee.accountId)).init();
  }
}
class EventDate {
  constructor(dateId) {
    this.id = dateId;
  }

  async init() {
    this._rawDate = await query('SELECT * FROM dates WHERE id=?', [this.id]);
    this.start = this._rawDate.timestampStart;
    this.end = this._rawDate.timestampEnd;
    this.attendees = await this.getAttendees();
    return this;
  }

  async getAttendees() {
    this._rawAttendees = await queryAll('SELECT id FROM attendees WHERE dateId=?', [this.id]);
    this.attendees = [];
    for (const att of this._rawAttendees) {
      this.attendees.push(await (new Attendee(att.id)).init());
    }
    return this.attendees;
  }
}
class Event {
  constructor(eventId) {
    this.id = eventId;
  }

  async init() {
    this._rawEvent = await query('SELECT * FROM events WHERE id=?', [this.id]);
    this.title = this._rawEvent.title;
    this.description = this._rawEvent.description;
    this.imageName = this._rawEvent.imageName;
    this.imageUrl = `http://${process.env.BASE_URL}${process.env.port !== '80' ? `:${process.env.PORT}` : ''}/images/events/${this.imageName}`;
    this.maximumAttendees = this._rawEvent.maximumAttendees;
    this.attendeeNotes = this._rawEvent.attendeeNotes;
    this.dates = await this.getDates();
    this.hosts = await this.getHosts();
    return this;
  }

  async getDates() {
    this._rawDates = await queryAll('SELECT id FROM dates WHERE eventId=?', [this.id]);
    this.dates = [];
    for (const d of this._rawDates) {
      this.dates.push(await (new EventDate(d.id)).init());
    }
    return this.dates;
  }

  async getHosts() {
    this._rawHosts = await queryAll('SELECT accountId FROM hosts WHERE eventId=?', [this.id]);
    this.hosts = [];
    for (const h of this._rawHosts) {
      this.hosts.push(await (new Account(h.accountId).init()));
    }
    return this.hosts;
  }

  get firstTimestamp() {
    let returnTimestamp = this.dates[0].start;
    for (const d of this.dates) {
      if (d.start < returnTimestamp) {
        returnTimestamp = d.start;
      }
    }
    return returnTimestamp;
  }
}

async function getEvent(eventId) {
  return (new Event(eventId)).init();
}
async function getEvents() {
  const events = await queryAll('SELECT id FROM events');
  const returnArray = [];
  for (const ev of events) {
    returnArray.push(await getEvent(ev.id));
  }
  return returnArray;
}

function checkPassword(plainText, hash) {
  return new Promise(async (resolve) => {
    const match = await bcrypt.compare(plainText, hash);
    resolve(match);
  });
}

/**
 *
 *
 * @param {String} username
 * @param {String} password
 * @return {Account}
 * @throws Throws an error if auth wasnt successfull.
 */
function authenticateAccount(username, password) {
  return new Promise(async (resolve) => {
    const account = await query('SELECT * FROM accounts WHERE username=?', [username]);
    if (account == null) {
      resolve(false);
    } else if (await checkPassword(password, account.password) === true) {
      resolve(account);
    } else {
      resolve(false);
    }
  });
}

async function getAccount(accountId) {
  return (new Account(accountId)).init();
}

async function updateNote(eventId, note) {
  return run('UPDATE events SET attendeeNotes=? WHERE id=?', [note, eventId]);
}

async function setPresence(attendeeId, presence) {
  return run('UPDATE attendees SET presence=? WHERE id=?', [presence, attendeeId]);
}

async function signupEvent(eventId, userId) {
  const event = await getEvent(eventId);
  return run(`INSERT INTO attendees (dateId, accountId) VALUES (${event.dates.map((d) => d.id).join(`, ${userId}),(`)}, ${userId})`);
}

async function delEvent(eventId) {
  const event = await getEvent(eventId);
  if (!event.imageName.includes('default')) {
    fs.unlinkSync(path.join(process.cwd(), '/public/images/events', event.imageName));
  }
  await run('DELETE FROM events WHERE id=?', [event.id]);
  await run('DELETE FROM hosts WHERE eventId=?', [event.id]);
  await run('DELETE FROM dates WHERE eventId=?', [event.id]);
  for (const d of event.dates) {
    await run('DELETE FROM attendees WHERE dateId=?', [d.id]);
  }
}

async function createEvent(title, description, imageName, maximumAttendees, hosts, dates) {
  await run('INSERT INTO events (title, description, imageName, maximumAttendees) VALUES (?, ?, ?, ?)', [title, description, imageName, parseInt(maximumAttendees)]);
  const eventRaw = await query('SELECT id FROM events ORDER BY id DESC LIMIT 1');
  if (typeof hosts === 'string') {
    hosts = [hosts];
  }
  for (const h of hosts) {
    await run('INSERT INTO hosts (eventId, accountId) VALUES (?, ?)', [parseInt(eventRaw.id), parseInt(h)]);
  }
  for (const d of dates) {
    await run('INSERT INTO dates (eventId, timestampStart, timestampEnd) VALUES (?, ?, ?)', [parseInt(eventRaw.id), parseInt(d.start), parseInt(d.end)]);
  }
}

async function getHosts() {
  const hostsRaw = await queryAll('SELECT id FROM accounts WHERE host=1');
  const hosts = [];
  for (const h of hostsRaw) {
    hosts.push(await (new Account(h.id)).init());
  }
  return hosts;
}

/**
 *
 *
 * @param {String} code Signup code
 * @return {*} null if invalid or a bool if host
 */
async function checkSignupCode(code) {
  const row = await query('SELECT host FROM registration WHERE code=?', [code]);
  if (row == null) {
    return null;
  }
  if (row.host === 1) {
    return true;
  }
  return false;
}

async function checkUsernameTaken(name) {
  const check = await query('SELECT id FROM accounts WHERE username=?', [name]);
  return (check != null);
}

async function register(displayName, username, password, host, code) {
  const pwHash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
  if ([0, 1].includes(host)) {
    await run('INSERT INTO accounts (displayName, username, password, host) VALUES (?, ?, ?, ?)', [displayName, username, pwHash, host]);
    await run('DELETE FROM registration WHERE code=?', [code]);
  }
}

async function generateRegistrationToken(host) {
  const token = crypto.randomBytes(5).toString('hex');
  await run('INSERT INTO registration (code, host) VALUES (?, ?)', [token, host]);
  return token;
}

module.exports = {
  getEvents,
  getEvent,
  authenticateAccount,
  getAccount,
  updateNote,
  setPresence,
  signupEvent,
  delEvent,
  createEvent,
  getHosts,
  checkSignupCode,
  register,
  checkUsernameTaken,
  generateRegistrationToken,
};
