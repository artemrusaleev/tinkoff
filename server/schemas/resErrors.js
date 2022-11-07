const mongoose = require('mongoose')

const { Schema } = mongoose
const errorsSchema = new Schema({
  inn: Number,
  tinkoffErrors: String,
})

module.exports = mongoose.model('RestErrors', errorsSchema)
