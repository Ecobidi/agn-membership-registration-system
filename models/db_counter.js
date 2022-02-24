let mongoose = require("mongoose")

let CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  }, 
  sequence_value: {
    type: Number,
    default: 0,
  }
})

module.exports = mongoose.model("counter", CounterSchema)