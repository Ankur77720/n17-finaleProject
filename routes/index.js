var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/currentVideo', function (req, res, next) {
  res.render('currentVideo')
})

router.get('/upload', (req, res, next) => {
  res.render('upload')
})


module.exports = router;
