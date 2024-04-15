var express = require('express');
var router = express.Router();
const axios = require('axios')

var userModel = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
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

const HOSTNAME = process.env.HOST_NAME;
const STORAGE_ZONE_NAME = process.env.STORAGE_ZONE;
const ACCESS_KEY = process.env.UPLOAD_KEY;
const STREAMING_KEY = process.env.STREAM_KEY


router.get('/currentVideo/:videoId', isloggedIn, async function (req, res, next) {

  const currentVideo = await videoModel.findOne({
    _id: req.params.videoId
  })

  const videoUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${currentVideo.media}?accessKey=${STREAMING_KEY}`

  res.render('currentVideo', { currentVideo, videoUrl })
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




const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadFileToBunnyCDN = (fileBuffer, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.put(`https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${fileName}`, fileBuffer, {
        headers: {
          AccessKey: ACCESS_KEY,
          'Content-Type': 'application/octet-stream',
        },
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

router.post('/upload', isloggedIn, upload.single('video_file'), async (req, res, next) => {
  const newVideo = videoModel.create({
    media: req.file.originalname,
    user: req.user._id,
    title: req.body.title,
    description: req.body.description
  })

  const response = await uploadFileToBunnyCDN(req.file.buffer, req.file.originalname)

  res.send(response)
})

/* ************** routes for video uploading ******************* */


/* ************* Route for streaming ****************** */


/* router.get('/stream/:fileName', isloggedIn, async (req, res, next) => {

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


  

}) */


/* 

0-

*/

/* ************* Route for streaming ****************** */


/* 
Read
stream
*/

module.exports = router;
