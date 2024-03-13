var express = require('express');
var router = express.Router();

var userModel = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
const upload = require('./multer')
const videoModel = require('./video')



router.get('/', isloggedIn, function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/register', (req, res, next) => {
  res.render('register')
})



router.get('/currentVideo', isloggedIn, function (req, res, next) {
  res.render('currentVideo')
})

router.get('/upload', isloggedIn, (req, res, next) => {
  res.render('upload')
})


/* **************** user authentication routes ********************* */

router.post('/register', function (req, res) {
  var userData = new userModel({
    username: req.body.username
  })
  userModel
    .register(userData, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      })
    })
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
  (req, res, next) => { }
);

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}

/* **************** user authentication routes ********************* */


/* ************** routes for video uploading ******************* */

router.post('/upload', isloggedIn, upload.single('vide_file'), async (req, res, next) => {

  const newVideo = await videoModel.create({
    media: req.file.filename,
    user: req.user._id
  })

  res.send(newVideo)

})

/* ************** routes for video uploading ******************* */


module.exports = router;
