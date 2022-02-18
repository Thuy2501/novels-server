const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    postReaderId: { type: mongoose.Types.ObjectId, ref: 'readerModel' },
    novels: { type: mongoose.Types.ObjectId, ref: 'Novels' }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('comment', commentSchema)