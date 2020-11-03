'use strict'

var express = require('express');
var router = express.Router();

// host/
router.get('/', function(req, res, next) {
  let staticReq = req;
  res.render('landing_page', {req: staticReq});
});

module.exports = router;
