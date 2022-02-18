const QA = require('../models/qaModel')
// const Novels = require('../models/productModel')

const qaCtrl = {
  getQA: async (req, res) => {
    try {
      const qa = await QA.find()
      res.json(qa)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getQARole: async (req, res) => {
    try {
      const qa = await QA.find({ role :0})
      res.json(qa)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  createQA: async (req, res) => {
    try {
      const { question, answer } = req.body
      const qa = await QA.findOne({ question })
      if (qa) return res.status(400).json({ msg: 'This qa already exists.' })

      const newQA = new QA({ question, answer })

      await newQA.save()
      res.json({ msg: 'Created a qa' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteQA: async (req, res) => {
    try {
      await QA.findByIdAndDelete(req.params.id)
      res.json({ msg: 'Deleted a QA' })
    } catch (err) {
      console.log('ajsdnsjkad')
      return res.status(500).json({ msg: err.message })
    }
  },
  updateQA: async (req, res) => {
    try {
      const { question, answer, role } = req.body
      await QA.findOneAndUpdate(
        { _id: req.params.id },
        { question, answer, role }
      )

      res.json({ msg: 'Updated a qa' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

module.exports = qaCtrl
