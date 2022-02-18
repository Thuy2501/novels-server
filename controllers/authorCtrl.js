const Authors = require('../models/authorModel')
// const Novels = require('../models/productModel')

const authorCtrl = {
  getAuthor: async (req, res) => {
    try {
      const author = await Authors.find()
      res.json(author)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  createAuthor: async (req, res) => {
    try {
      // if user have role = 1 ---> admin
      // only admin can create , delete and update author
      const { name } = req.body
      const author = await Authors.findOne({ name })
      if (author)
        return res.status(400).json({ msg: 'This author already exists.' })

      const newAuthor = new Authors({ name })

      await newAuthor.save()
      res.json({ msg: 'Created a author', id: newAuthor._id })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteAuthor: async (req, res) => {
    try {
      await Authors.findByIdAndDelete(req.params.id)
      res.json({ msg: 'Deleted a Author' })
    } catch (err) {
      console.log('ajsdnsjkad')
      return res.status(500).json({ msg: err.message })
    }
  },
  updateAuthor: async (req, res) => {
    try {
      const { name } = req.body
      await Authors.findOneAndUpdate({ _id: req.params.id }, { name })

      res.json({ msg: 'Updated a author' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

module.exports = authorCtrl