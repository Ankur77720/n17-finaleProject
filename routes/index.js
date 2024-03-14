var express = require('express');
var router = express.Router();

var userModel = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
const upload = require('./multer')
const videoModel = require('./video')
const fs = require('fs')



router.get('/', isloggedIn, async function (req, res, next) {
  const videos = await videoModel.find()
  res.render('index', { title: 'Express', videos });
});

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/register', (req, res, next) => {
  res.render('register')
})



router.get('/currentVideo/:videoId', isloggedIn, async function (req, res, next) {

  const currentVideo = await videoModel.findOne({
    _id: req.params.videoId
  })

  res.render('currentVideo', { currentVideo })
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
    user: req.user._id,
    title: req.body.title,
    description: req.body.description
  })

  res.send(newVideo)

})

/* ************** routes for video uploading ******************* */


/* ************* Route for streaming ****************** */


router.get('/stream/:fileName', isloggedIn, async (req, res, next) => {

  const range = req.headers.range

  const parts = range.replace('bytes=', "").split("-")
  const start = parseInt(parts[ 0 ], 10)
  let chunkSize = 1024 * 1024 * 4
  let end = start + chunkSize - 1

  const file = fs.statSync(`./public/video/${req.params.fileName}`)
  const fileSize = file.size

  if (end >= fileSize) {
    end = fileSize - 1
    chunkSize = start - end + 1
  }

  const head = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize - 1,
    "Content-Type": "video/mp4"
  }

  res.writeHead(206, head)

  fs.createReadStream(`./public/video/${req.params.fileName}`, {
    start, end
  }).pipe(res)


  /*  const head = {
     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
     'Accept-Ranges': 'bytes',
     'Content-Length': chunksize,
     'Content-Type': 'video/mp4',
   };
   res.writeHead(206, head); */



  /*  console.log(range)
   console.log(parts)
   console.log(start) */

})


/* 

0-

*/

/* ************* Route for streaming ****************** */


/* 
Read
stream
*/

module.exports = router;
