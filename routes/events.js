var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  res.render('event-page', {req, event: {
    id: parseInt(req.params.id),
    title: `ID: ${req.params.id}`,
    description: "Foo bar",
    imageName: "example800x400-1.png"
  }})
});

module.exports = router;
