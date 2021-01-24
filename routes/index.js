const express = require('express');

const router = express.Router();
const Database = require('../src/database');

// host/
router.get('/', async (req, res) => {
  const staticReq = req;
  res.render('landing_page', {
    req: staticReq, cookies: req.session, events: await Database.getEvents(),
  });
});

router.get('/dashboard', async (req, res) => {
  res.render('dashboard', { req, events: await Database.getEvents(), hosts: await Database.getHosts() });
});

router.get('/register/:code', async (req, res) => {
  const check = await Database.checkSignupCode(req.params.code);
  if (check == null) {
    res.redirect('/');
  } else {
    res.render('register', { req });
  }
});

router.post('/register', async (req, res) => {
  const {
    code, displayName, password, username,
  } = req.body;
  const check = await Database.checkSignupCode(code);
  if (await Database.checkUsernameTaken(username)) {
    res.redirect(`/register/${code}?warn=usernameTaken`);
  } else {
    Database.register(displayName, username, password, check ? 1 : 0, code);
    res.redirect('/');
  }
});

router.get('/dev/register', async (req, res) => {
  if (req.ip === '::1') {
    const token = await Database.generateRegistrationToken(0);
    res.status(200).end(`Registration URL for a non-host: ${req.protocol}://${req.headers.host}/register/${token}`);
  } else {
    res.redirect('/');
  }
});

router.get('/dev/register/host', async (req, res) => {
  if (req.ip === '::1') {
    const token = await Database.generateRegistrationToken(1);
    res.status(200).end(`Registration URL for a host: ${req.protocol}://${req.headers.host}/register/${token}`);
  } else {
    res.redirect('/');
  }
});

module.exports = router;
