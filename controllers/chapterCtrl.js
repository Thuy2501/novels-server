const Chapters = require('../models/chapterModel')
const Comments = require('../models/commentModel')
const readerModel = require('../models/readerModel')
const Chapter = require('../models/novelModel')
const novelModel = require('../models/novelModel')

class APIfeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 9
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

const chapterCtrl = {
  createChapter: async (req, res) => {
    try {
      const { content, title, novels, role } = req.body
      const newChapter = new Chapters({
        title,
        content,
        novels,
        role
      })
      await newChapter.save()

      res.json({
        msg: 'Created Chapter!',
        newChapter: {
          ...newChapter._doc,
          novels: req.novels
        },
        chapter: newChapter
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  // getChap: async (req, res) => {
  //   try {
  //     const chapter = await Chapters.find()
  //    res.json({
  //      status: 'success',
  //      result: chapter.length,
  //      chapter: chapter
  //    })
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message })
  //   }
  // },
  getChap: async (req, res) => {
    try {
      const chapter = await Chapters.find()
      res.json(chapter)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getChapRole: async (req, res) => {
    try {
      const chapter = await Chapters.find({ role: 1 })
      res.json(chapter)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  updateChapter: async (req, res) => {
    try {
      const { content, title, role } = req.body.data
      console.log(req.body)
      await Chapters.findOneAndUpdate(
        { _id: req.params.id },
        {
          content,
          title,
          role
        }
      )

      res.json({
        msg: 'Updated Chapter!'
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateChapFE: async (req, res) => {
    try {
      const { content, title } = req.body.data
      console.log(req.body)
      await Chapters.findOneAndUpdate(
        { _id: req.params.id },
        {
          content,
          title
        }
      )

      res.json({
        msg: 'Updated Chapter!'
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  deleteChapter: async (req, res) => {
    const idNovel = req.header('idNovel')

    try {
      const chapter = await Chapters.findOneAndDelete({
        _id: req.params.id
      })

      await novelModel.findOneAndUpdate(
        { _id: idNovel },
        { $pull: { chapter: req.params.id } }
      )

      res.json({
        msg: 'Deleted Chapter!',
        newChapter: {
          ...chapter,
          novels: req.novels
        }
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

module.exports = chapterCtrl
