const novelModel = require('../models/novelModel')

const passNovel = async (req, res, next) => {
  try {
    const novel = await novelModel.findOne({ _id: req.novel.id })

    if (novel.role !== 1)
      return res.status(500).json({ msg: 'Truyện không đạt' })

    next()
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = passNovel
