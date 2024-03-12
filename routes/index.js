var express = require('express');
var router = express.Router();



router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/register', (req, res, next) => {
  res.render('register')
})



router.get('/currentVideo', function (req, res, next) {
  res.render('currentVideo')
})

router.get('/upload', (req, res, next) => {
  res.render('upload')
})

router.post("/upload",)


module.exports = router;
