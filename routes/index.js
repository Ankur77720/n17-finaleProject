const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Video = require('./video');
const fs = require('fs');
const path = require('path');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const crypto = require('crypto');






mongoose.connect(process.env.DBURL).then(() => {
  console.log("Connected to database");
}).catch(err => {
  console.log(err);
});

const conn = mongoose.connection;
let bucket;

conn.once('open', () => {
  bucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage });



async function uploadToMongo(req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const contentType = getContentType(req.file.originalname);
    const fileName = crypto.randomBytes(16).toString('hex'); // Generating a 32-character unique file name
    const uploadStream = bucket.openUploadStream(fileName, { contentType });

    // Create a readable stream from req.file.buffer
    const readableStream = Readable.from(req.file.buffer);

    // Pipe the readable stream to the upload stream
    readableStream.pipe(uploadStream);

    uploadStream.on('finish', async () => {
      try {
        // Create a new video document in MongoDB
        const newVideo = await Video.create({
          media: fileName, // Assigning the unique file name as media property
          thumbnail: req.body.thumbnail, // Assuming you're also passing thumbnail in the request
          title: req.body.title,
          description: req.body.description
        });
        res.status(200).json({ message: 'File uploaded successfully.', video: newVideo });
      } catch (error) {
        console.error('Error creating video document:', error);
        res.status(500).send('Internal server error.');
      }
    });

    uploadStream.on('error', (error) => {
      console.error('Error uploading file to GridFS:', error);
      return res.status(500).send('Internal server error.');
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).send('Internal server error.');
  }
}


function getContentType(filename) {
  const ext = filename.slice(filename.lastIndexOf('.') + 1);
  switch (ext) {
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'text/javascript';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

router.post('/upload', upload.single('video'), uploadToMongo);

router.get('/stream/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const videoFile = await bucket.find({ filename }).toArray();

    if (videoFile.length === 0) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const fileMetadata = videoFile[ 0 ];
    const fileSize = fileMetadata.length;

    const range = req.headers.range;
    if (range) {
      const MAX_CHUNK_SIZE = 4 * 1024 * 1024; // 4MB in bytes

      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[ 0 ], 10);
      let end = parts[ 1 ] ? parseInt(parts[ 1 ], 10) : fileSize - 1;
      console.log(start, end)

      // Calculate chunk size
      let chunksize = Math.min(MAX_CHUNK_SIZE, (end - start));

      // Adjust end point if chunk size exceeds end point
      if (chunksize > (end - start) + 1) {
        end = fileSize - 1;
        chunksize = end - start + 1;
        console.log('chunk update')
      }

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize + 1,
        'Content-Type': 'video/mp4', // Set content type based on file metadata
      });

      console.log(start, end + 1)

      bucket.openDownloadStreamByName(filename, { start, end: end + 1 }).pipe(res);
    } else {
      res.status(416).send('Range not satisfiable');
    }
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).send('Internal server error.');
  }
});







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
