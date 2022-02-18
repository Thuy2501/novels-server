const Novels = require('../models/novelModel')
const readerModel = require('../models/readerModel')
const Comments = require('../models/commentModel')
const Chapters = require('../models/chapterModel')
// Filter, sorting and paginating

class APIfeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }
  filtering() {
    const queryObj = { ...this.queryString } //queryString = req.query

    const excludedFields = ['page', 'sort', 'limit']
    excludedFields.forEach((el) => delete queryObj[el])

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => '$' + match
    )

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.query.find(JSON.parse(queryStr))

    return this
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

  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

const novelCtrl = {
  getNovels: async (req, res) => {
    try {
      const features = new APIfeatures(Novels.find(), req.query)
        .filtering()
        .sorting()
        .paginating()

      // const novels = await Novels.find()
      const novels = await features.query
      res.json({
        result: novels.length,
        novels: novels
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getUserNovels: async (req, res) => {
    try {
      // const features = new APIfeatures(Novels.find(), { poster: req.reader.id })
      //   .filtering()
      //   .sorting()
      //   .paginating()

      const novels = await Novels.find({ poster: req.reader.id })
      // console.log('req.reader.id..', req.reader.id)
      res.json({
        result: novels.length,
        novels: novels
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getNovelsRole: async (req, res) => {
    try {
      const features = new APIfeatures(Novels.find({ role: 1 }), req.query)
        .sorting()
        .filtering()
      // const novels = await Novels.find({ role: 1 })
      const novels = await features.query
      res.json({
        result: novels.length,
        novels: novels
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  createNovel: async (req, res) => {
    try {
      const { title, category, author, description, images, nxb, role } = req.body
      const poster = req.reader.id
      // if (!images) return res.status(400).json({ msg: 'No image upload' })
      const novel = await Novels.findOne({ title })
      if (novel)
        return res.status(400).json({ msg: 'This novel already exists.' })

      const newNovel = new Novels({
        title: title,
        description,
        images,
        category,
        author,
        poster,
        nxb,
        role
      })

      await newNovel.save()
      res.json({ msg: 'Created a novel' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteNovel: async (req, res) => {
    try {
      await Novels.findByIdAndDelete(req.params.id)
      await readerModel.updateMany(
        {},
        {
          $pull: { following: req.params.id }
        },
        { new: true }
      )

      await Chapters.remove({ novels: req.params.id })
      await Comments.remove({ novels: req.params.id })
      res.json({ msg: 'Deleted a Novel' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateNovel: async (req, res) => {
    try {
      const {
        title,
        images,
        category,
        description,
        checked,
        author,
        nxb,
        role
      } = req.body
      if (!images) return res.status(400).json({ msg: 'No image upload' })

      await Novels.findOneAndUpdate(
        { _id: req.params.id },
        {
          title,
          images,
          description,
          category,
          author,
          checked,
          nxb,
          role
        }
      )
      res.json({ msg: 'Updated a Novel' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateNovelStatus: async (req, res) => {
    try {
      const { checked } = req.body

      await Novels.findOneAndUpdate(
        { _id: req.params.id },
        {
          checked
        }
      )

      res.json({ msg: 'Cập nhật thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateChapterNovel: async (req, res) => {
    try {
      const { chapter } = req.body
      // if (!images) return res.status(400).json({ msg: 'No image upload' })

      await Novels.findOneAndUpdate(
        { _id: req.params.id },
        {
          chapter
        }
      )
      res.json({ msg: 'Updated a chapter Novel' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateCommentNovel: async (req, res) => {
    try {
      const { comment } = req.body

      await Novels.findByIdAndUpdate(
        { _id: req.params.id },
        {
          comment
        }
      )
      res.json({ msg: 'Updated a comment Novel' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  followNovel: async (req, res) => {
    try {
      const reader = await readerModel.find({
        _id: req.reader.id,
        following: req.params.id
      })
      if (reader.length > 0) {
        await readerModel.findByIdAndUpdate(
          req.reader.id,
          {
            $pull: { following: req.params.id }
          },
          { new: true }
        )
        return res.status(200).json({ msg: 'Bạn hủy theo dõi bài đăng này.' })
      }

      const follow = await readerModel.findByIdAndUpdate(
        req.reader.id,
        {
          $push: { following: req.params.id }
        },
        { new: true }
      )

      if (!follow)
        return res.status(400).json({ msg: 'Người đọc này không tồn tại.' })

      res.json({ msg: 'Theo dõi truyện!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  totleFollow: async (req, res) => {
    try {
      const reader = await readerModel.find()
      const novel = await Novels.find({ _id: req.params.id })
      console.log('ddcdc..............', novel[0]._id)
      const tesst = reader.map((item) => ({
        follo: item.following.map((idFollow) => ({
          id: idFollow
        })),
        id: item.id
      }))
    } catch (error) {}
  },
  //like
  likesNovel: async (req, res) => {
    try {
      const reader = req.reader.id
      const novel = await Novels.find({
        _id: req.params.id
      })
      //đẩy ra khỏi mảng
      if (novel[0].likes.includes(reader)) {
        await Novels.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { likes: reader }
          },
          { new: true }
        )
        return res.status(200).json({ msg: ' You unlikes this novel' })
      }
      //thêm vào mảng
      const like = await Novels.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likes: reader }
        },
        { new: true }
      )

      if (!like)
        return res.status(400).json({ msg: 'This reader does not exist' })

      res.json({ mes: 'Likes Novel!' })
    } catch (err) {
      return res.status(400).json({ msg: 'this reader does not exits.' })
    }
  },

  getLikeNovel: async (req, res) => {
    try {
      const reader = await readerModel.find()
      const novel = await Novels.find({
        _id: req.params.id
      })
      console.log('novelid', novel[0].likes[0])
      const like = novel[0].likes.map((idReader) => {
        return {
          id: idReader,
          name: reader.filter((req) => req.id === idReader.toString()).pop()
            .name
        }
      })
      // console.log('novelid', like)
      res.json({
        status: 'success',
        result: like.length,
        like: like
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getAllLikeNovel: async (req, res) => {
    try {
      const novel = await readerModel.find()

      res.json({
        reader: reader.map((item) => ({
          id: item._id,
          name: item.name,
          likes: item.likes
        }))
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }

  //cmt
  // commentNovel: async (req, res) => {

  //   try {
  //     const { content, novels } = req.body
  //     const newComment = new Comment({
  //       content,
  //       postReaderId: req.reader.id,
  //       novels
  //     })
  //     await newComment.save()
  //     res.json({
  //       msg: 'Created a novel',
  //       newComment: {
  //         ...newComment._doc,
  //         novels: req.novels
  //       },
  //       comment: newComment
  //     })
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message })
  //   }
  // },

  // getCommentNovel: async (req, res) => {
  //   try {
  //       const features = new APIfeatures(Comment.find(), req.query)
  //         .filtering()
  //         .sorting()
  //         .paginating()

  //     const listComment = await features.query
  //     res.json({ listComment })
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message })
  //   }
  // }
}

module.exports = novelCtrl
