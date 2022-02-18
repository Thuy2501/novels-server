const mongoose = require('mongoose')

const cmtSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    tag: Object,
    reply: mongoose.Types.ObjectId,
    likes: [{ type: mongoose.Types.ObjectId, ref: 'readerModel' }],
    reader: { type: mongoose.Types.ObjectId, ref: 'readerModel' },
    novelId: mongoose.Types.ObjectId,
    postReaderId: mongoose.Types.ObjectId
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('cmt', cmtSchema)
