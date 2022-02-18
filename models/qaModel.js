const mongoose = require('mongoose')

const qaSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String
    },
    role: {
      type: Number,
      default: 0 // 0 = moderators, 1 = admin
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('QA', qaSchema)