const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    title: String,
    description: String,
    media: String,
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    }
})


module.exports = mongoose.model('video', videoSchema)
