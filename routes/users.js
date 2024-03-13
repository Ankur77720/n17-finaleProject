const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://0.0.0.0/youtube_n17').then(() => {
  console.log('connected to db')
})

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  subscriptions: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  } ],
  subscribers: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  } ],
  likes: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "video"
  } ],
})

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema)