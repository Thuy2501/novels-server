const mongoose = require('mongoose')

const readerModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name!'],
      trim: true,
      unique: true
    },
    age: {
      type: Number,
      default: 0
    },
    email: {
      type: String,
      required: [true, 'Please enter your email!'],
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Please enter your password!']
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dint5xlbc/image/upload/v1633613501/img_novel/Thi%E1%BA%BFt_k%E1%BA%BF_kh%C3%B4ng_t%C3%AAn_3_l7fehw.png'
    },
    role: {
      type: Number,
      default: 0 // 0 = moderators, 1 = admin
    },
    following: [{ type: mongoose.Types.ObjectId, ref: 'Novels' }],
    novelSavePage: [
      {
        type: Object,
        require: [true, 'Please enter your novelSavePage!']
      }
    ]
  },

  {
    timestamps: true
  }
)

module.exports = mongoose.model('readerModel', readerModel)
