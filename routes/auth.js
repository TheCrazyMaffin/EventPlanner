var express = require('express');
const passport = require('passport');
const router = express.Router();

router.post('/', passport.authenticate('local', {successRedirect: "/", failureRedirect: "/signin?ref=signin"}));

module.exports = router;
