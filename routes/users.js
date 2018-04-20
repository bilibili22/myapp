var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users',{
      menuActiveIndex:2,
      rule:req.cookies.rule
  });
});

module.exports = router;
