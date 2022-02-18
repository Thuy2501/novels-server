const Comments = require('../models/commentModel')
const Novels = require('../models/novelModel')


class APIfeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }
  //sap xep
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }
}


const commentCtrl = {
  createComment: async (req, res) => {
    try {
      const { novels, content } = req.body

      const newComment = new Comments({
        content,
        postReaderId: req.reader.id,
        novels
      })

      await Novels.findOneAndUpdate(
        { _id: novels },
        {
          $push: { comments: newComment._id }
        },
        { new: true }
      )

      await newComment.save()
      res.json({ newComment })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getComment: async (req, res) => {
    try {
      const comment = await Comments.find()
      res.json({
        status: 'success',
        result: comment.length,
        comment: comment
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getCommentId: async (req, res) => {
    try {
      const features = new APIfeatures(
        Comments.find({ novels: req.params.id }),
        req.query
      ).sorting()
      const comment = await features.query
      
      res.json({
        status: 'success',
        result: comment.length,
        comment: comment
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  updateComment: async (req, res) => {
    try {
      const { content } = req.body
      await Comments.findByIdAndUpdate({ _id: req.params.id }, { content })
      res.json({msg:'Update cmt'})
    } catch (err) {
      return res.status(500).json({msg:err.message})
    }
  },

  deleteComment: async (req, res) => {
    const idNovel = req.header('idNovel')

    try {
      const comment = await Comments.findOneAndDelete({
        _id: req.params.id
      })

      await Novels.findOneAndUpdate(
        { _id: idNovel },
        { $pull: { comments: req.params.id } }
      )

      res.json({
        msg: 'Deleted comment!',
        newComment: {
          ...comment,
          novels: req.novels
        }
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}
module.exports = commentCtrl
