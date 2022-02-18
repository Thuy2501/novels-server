const Reader = require('../models/readerModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const authCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body
      let newName = name.toLowerCase().replace(/ /g, '')

      const reader_name = await Reader.findOne({ name: newName })
      if (reader_name)
        return res.status(400).json({ msg: 'Tên người dùng này đã tồn tại.' })

      if (!name || !email || !password)
        return res
          .status(400)
          .json({ msg: 'Vui lòng điền vào tất cả các dòng' })

      if (!validateEmail(email))
        return res.status(400).json({ msg: 'Email không hợp lệ' })

      const reader_email = await Reader.findOne({ email })
      if (reader_email)
        return res.status(400).json({ msg: 'Email này đã tồn tại' })

      if (password.length < 6)
        return res.status(400).json({ msg: 'Mật khẩu phải có ít nhất 6 kí tự' })

      const passwordHash = await bcrypt.hash(password, 12)

      const newReader = new Reader({
        name,
        email,
        password: passwordHash
      })

      const access_token = createAccessToken({ id: newReader._id })
      const refresh_token = createRefreshToken({ id: newReader._id })

      res.cookie('refreshtoken', refresh_token, {
        httpOnly: true,
        path: '/reader/refresh_token',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
      })

      await newReader.save()

      res.json({
        msg: 'Đăng kí thành công!',
        access_token,
        reader: {
          ...newReader._doc,
          password: ''
        }
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password)
        return res
          .status(400)
          .json({ msg: 'Vui lòng điền vào tất cả các dòng' })

      if (!validateEmail(email))
        return res.status(400).json({ msg: 'Email không hợp lệ' })
      // const user = await Reader.findOne({ email }).populate(
      //   'followers following',
      //   'avatar username fullname followers following'
      // )
      const reader = await Reader.findOne({ email })
      if (!reader)
        return res.status(400).json({ msg: 'Email này không tồn tại!' })

      // if (!user)
      //   return res.status(400).json({ msg: 'This email does not exist.' })

      const isMatch = await bcrypt.compare(password, reader.password)
      if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu sai' })

      const access_token = createAccessToken({ id: reader._id })
      const refresh_token = createRefreshToken({ id: reader._id })

      res.cookie('refreshtoken', refresh_token, {
        httpOnly: true,
        path: '/reader/refresh_token',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
      })

      res.json({
        msg: 'Login Success!',
        access_token,
        reader: {
          ...reader._doc,
          password: ''
        }
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  loginAD: async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password)
        return res
          .status(400)
          .json({ msg: 'Vui lòng điền vào tất cả các dòng' })

      if (!validateEmail(email))
        return res.status(400).json({ msg: 'Email không hợp lệ' })
      
      if (email !== 'ad@yopmail.com')
        return res.status(400).json({ msg: 'Email không phải Admin' })
      
      const reader = await Reader.findOne({ email })
      if (!reader)
        return res.status(400).json({ msg: 'Email này không tồn tại!' })

      // if (!user)
      //   return res.status(400).json({ msg: 'This email does not exist.' })

      const isMatch = await bcrypt.compare(password, reader.password)
      if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu sai' })

      const access_token = createAccessToken({ id: reader._id })
      const refresh_token = createRefreshToken({ id: reader._id })

      res.cookie('refreshtoken', refresh_token, {
        httpOnly: true,
        path: '/reader/refresh_token',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
      })

      res.json({
        msg: 'Login Success!',
        access_token,
        reader: {
          ...reader._doc,
          password: ''
        }
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/reader/refresh_token' })
      return res.json({ msg: 'Logged out!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  generateAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken
      if (!rf_token) return res.status(400).json({ msg: 'Please login now.' })

      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: 'Please login now.' })

          const reader = await Reader.findById(result.id)
          // .select('-password')
          // .populate(
          //   'followers following',
          //   'avatar username fullname followers following'
          // )

          if (!reader)
            return res.status(400).json({ msg: 'This does not exist.' })

          const access_token = createAccessToken({ id: result.id })

          res.json({
            access_token,
            reader
          })
        }
      )
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

// function validateEmail(email) {
//   const re =
//     /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//   return re.test(email)
// }
const validateEmail = (email) =>{
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  })
}

module.exports = authCtrl
