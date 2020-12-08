'use strict'

var express = require('express');
var router = express.Router();

// host/
router.get('*', function(req, res, next) {
    if(req.query.cookies && req.query.cookies == "1"){
        req.session.cookieAgreement = true;
        next();
    }else if(!req.session.cookieAgreement){
        res.render('cookies', {req});
    }else{
        next();
    }
});

module.exports = router;
