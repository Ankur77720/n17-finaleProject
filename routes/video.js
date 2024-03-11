const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    media: String,
    thumbnail: String,
    title: String,
    description: String,
})


module.exports = mongoose.model('video', videoSchema)