const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    nameActor: {
      type: String
    },
    totalEpisode: {
      type: String
    },
    link: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Film', filmSchema)
