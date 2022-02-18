const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Authors', authorSchema)
