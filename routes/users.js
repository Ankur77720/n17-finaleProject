const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://0.0.0.0/stream").then(() => {
  console.log("connected to db")
}).catch(err => {
  console.log(err)
})

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  profileImage: {
    type: String,
    default: "https://images.pexels.com/photos/19987954/pexels-photo-19987954/free-photo-of-road-in-forest.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
  },
  subscriptions: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  } ]
})

userSchema.plugin(plm)


module.exports = mongoose.model("user", userSchema)

