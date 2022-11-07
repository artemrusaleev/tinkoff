const mongoose = require('mongoose')

const { Schema } = mongoose
const restaurantSchema = new Schema({
  inn: Number,
  name: String,
  data: String,
})

module.exports = mongoose.model('Restaurant', restaurantSchema)
