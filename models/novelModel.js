const mongoose = require('mongoose')

const novelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    images: {
      type: String,
      default:
        'https://res.cloudinary.com/dint5xlbc/image/upload/v1625038677/img_novel/img_gvhmuj.png'
    },
    category: [{ type: mongoose.Types.ObjectId, ref: 'Categorys' }],
    author: { type: mongoose.Types.ObjectId, ref: 'Authors' },
    chapter: [{ type: mongoose.Types.ObjectId, ref: 'Chapter' }],
    poster: { type: mongoose.Types.ObjectId, ref: 'readerModel' },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'readerModel' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    checked: {
      type: Boolean,
      default: false
    },
    status: {
      type: Boolean,
      default: false
    },
    nxb: {
      type: String
    },
    role: {
      type: Number,
      default: 0 
    }
  },
  {
    timestamps: true //important
  }
)

module.exports = mongoose.model('Novels', novelSchema)
