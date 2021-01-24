const express = require('express');
const passport = require('passport');

const router = express.Router();

router.post('/', global.passport.authenticate('local', { successRedirect: '/', failureRedirect: '/?loginfailed' }));

router.post('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

module.exports = router;
