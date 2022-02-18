const mongoose = require('mongoose')

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    content: String,
    novels: { type: mongoose.Types.ObjectId, ref: 'Novels' },
    role: {
      type: Number,
      default: 0 // 0 = moderators, 1 = admin
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Chapter', chapterSchema)
