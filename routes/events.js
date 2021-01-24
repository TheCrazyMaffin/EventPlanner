const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Database = require('../src/database');

const upload = multer({ dest: 'public/images/events' });

const router = express.Router();

router.get('/:id', async (req, res) => {
  res.render('event-page', {
    req,
    event: await Database.getEvent(req.params.id),
  });
});

router.post('/:id/notes', async (req, res) => {
  if (req.user && req.user.host === 1) {
    const { id } = req.params;
    const { note } = req.body;
    await Database.updateNote(id, note);
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
});

router.post('/attendees/:id', async (req, res) => {
  if (req.user && req.user.host === 1) {
    const { id } = req.params;
    const { presence } = req.body;
    if (presence.toString() === '1' || presence.toString() === '0') {
      await Database.setPresence(id, presence);
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  }
});

router.post('/:id/signup', async (req, res) => {
  const events = await Database.getEvents();
  const eventId = parseInt(req.params.id);
  if (req.user && !events.filter((ev) => ev.id === eventId)[0].dates[0].attendees.some((att) => att.account.id === req.user.id) && events.filter((ev) => ev.id === eventId)[0].dates[0].attendees.length < events.filter((ev) => ev.id === eventId)[0].maximumAttendees) {
    await Database.signupEvent(eventId, req.user.id);
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
});

router.post('/:id/delete', async (req, res) => {
  let eventId;
  try {
    eventId = parseInt(req.params.id);
  } catch (error) {
    res.status(400).end();
  }
  if (req.user && req.user.host === 1) {
    await Database.delEvent(eventId);
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
});

router.post('/create', upload.single('image'), async (req, res) => {
  if (!req.user) {
    res.redirect('/');
  } else {
    let { dates } = req.body;
    const {
      description, hosts, maximumAttendees, title,
    } = req.body;
    const datesRaw = dates.substring(0, dates.length - 1).split(',');
    dates = [];
    for (const d of datesRaw) {
      const sp = d.split('-');
      dates.push({
        start: sp[0],
        end: sp[1],
      });
    }
    if (!('image/gif image/jpg image/jpeg image/png').includes(req.file.mimetype)) {
      res.status(400).end();
      res.redirect('/');
    } else {
      const imageName = `${req.file.filename}.${req.file.mimetype.split('/')[1]}`;
      fs.renameSync(path.join(process.cwd(), 'public/images/events', req.file.filename), path.join(process.cwd(), 'public/images/events', imageName));
      await Database.createEvent(title, description, imageName, maximumAttendees, hosts, dates);
      res.redirect('/dashboard');
    }
  }
});

module.exports = router;
