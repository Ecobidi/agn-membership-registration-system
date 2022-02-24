const mongoose = require('mongoose')
const DBCounterModel = require('./db_counter')

let UserSchema = new mongoose.Schema({
  serial_number: {
    unique: true,
    type: Number,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
  },
  first_name: {
    type: String,
  },
  surname: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  photo: {
    type: String,
  }
}, {timestamps: { createdAt: true }})

UserSchema.pre("save", function(next){
  // console.log("serial_number ", this.serial_number)
  if (this.serial_number == undefined) {
    DBCounterModel.findOneAndUpdate({ _id: "users_id" }, { $inc: { sequence_value: 1}}, {upsert: true}, (err, doc) => {
      this.serial_number = doc.sequence_value
      // console.log("internal serial ", this.serial_number)
    })
  }
  next()
})

module.exports = mongoose.model('user', UserSchema)