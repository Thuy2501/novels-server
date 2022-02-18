const readerModel = require('../models/readerModel')

// const authAdmin = async (req, res, next) => {
//   try {
//     const reader = await readerModel.findOne({ _id: req.reader.id })

//     if (reader.role !== 1)
//       return res.status(500).json({ msg: 'Admin resources access denied.' })

//     next()
//   } catch (err) {
//     return res.status(500).json({ msg: err.message })
//   }
// }

const authAdmin = async (req, res, next) => {
  try {
    const reader = await readerModel.findOne({ _id: req.reader.id })

    if (reader.name == 'ad' && reader.email == 'ad@yopmail.com') {
      next()
    } else {
      return res.status(500).json({
        msg: 'Quyền truy cập tài nguyên của quản trị viên bị từ chối.'
      })
    }
      
  } catch (err) {
    return res.status(500).json({ msg: err.message })
  }
}

module.exports = authAdmin