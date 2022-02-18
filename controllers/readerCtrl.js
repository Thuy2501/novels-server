const readerModel = require('../models/readerModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendMail')

const { google } = require('googleapis')
const { OAuth2 } = google.auth
const fetch = require('node-fetch')

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)

const { CLIENT_URL } = process.env

const readerCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password)
        return res
          .status(400)
          .json({ msg: 'Vui lòng điền vào tất cả các dòng.' })

      if (!validateEmail(email))
        return res.status(400).json({ msg: 'Email không hợp lệ.' })

      const reader = await readerModel.findOne({ email })
      if (reader) return res.status(400).json({ msg: 'Email này đã tồn tại.' })

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: 'Mật khẩu phải có ít nhất 6 ký tự.' })

      const passwordHash = await bcrypt.hash(password, 12)

      const newReader = {
        name,
        email,
        password: passwordHash
      }

      const activation_token = createActivationToken(newReader)
      //console.log({ activation_token })
      const url = `${CLIENT_URL}/reader/activate/${activation_token}`
      sendMail(email, url, 'Xác minh địa chỉ email của bạn')
      res.json({
        msg: 'Đăng ký thành công! Vui lòng kích hoạt email của bạn để bắt đầu.'
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body
      const reader = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      )

      const { name, email, password } = reader

      const check = await readerModel.findOne({ email })
      if (check) return res.status(400).json({ msg: 'Email này đã tồn tại.' })

      const newReader = new readerModel({
        name,
        email,
        password
      })

      await newReader.save()

      res.json({ msg: 'Tài khoản đã được kích hoạt!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body
      const reader = await readerModel.findOne({ email })
      if (!reader)
        return res.status(400).json({ msg: 'Email này không tồn tại!' })

      const isMatch = await bcrypt.compare(password, reader.password)
      if (!isMatch) return res.status(400).json({ msg: 'Sai mật khẩu!' })

      const refresh_token = createRefreshToken({ id: reader._id })
      res.cookie('refreshtoken', refresh_token, {
        httpOnly: true,
        path: '/reader/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      res.json({ msg: 'Đăng nhập thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken
      if (!rf_token) {
        return res.status(400).json({ msg: 'Hãy đăng nhập ngay bây giờ!' })
      }

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, reader) => {
        if (err)
          return res.status(400).json({ msg: 'Hãy đăng nhập ngay bây giờ!' })

        const access_token = createAccessToken({ id: reader.id })
        res.json({ access_token })
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body
      const reader = await readerModel.findOne({ email })
      if (!reader)
        return res.status(400).json({ msg: 'Email này không tồn tại.' })

      const access_token = createAccessToken({ id: reader._id })
      const url = `${CLIENT_URL}/reader/reset/${access_token}`

      sendMail(email, url, 'Đặt lại mật khẩu của bạn')
      res.json({ msg: 'Gửi lại mật khẩu, vui lòng kiểm tra email của bạn!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body
      console.log(password)
      const passwordHash = await bcrypt.hash(password, 12)

      await readerModel.findOneAndUpdate(
        { _id: req.reader.id },
        {
          password: passwordHash
        }
      )
      res.json({ msg: 'Mật khẩu đã được thay đổi thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getReaderInfor: async (req, res) => {
    try {
      const reader = await readerModel
        .findById(req.reader.id)
        .select('-password')

      res.json(reader)
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getReaderAllInfor: async (req, res) => {
    try {
      const readers = await readerModel.find().select('-password')

      res.json(
        readers
      )
      // res.json({
      //   status: 'success',
      //   result: readers.length,
      //   readers: readers
      // })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/reader/refresh_token' })
      return res.json({ msg: 'Logged out.' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateReader: async (req, res) => {
    try {
      const { name, age, avatar } = req.body
      await readerModel.findOneAndUpdate(
        { _id: req.reader.id },
        {
          name,
          age,
          avatar
        }
      )

      res.json({ msg: 'Cập nhật thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateNovelSavePage: async (req, res) => {
    try {
      const { novelSavePage } = req.body

      await readerModel.findOneAndUpdate(
        { _id: req.reader.id },
        {
          novelSavePage
        }
      )

      res.json({ msg: 'Cập nhật thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateReaderRole: async (req, res) => {
    try {
      const { role } = req.body

      await readerModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          role
        }
      )

      res.json({ msg: 'Cập nhật thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteReader: async (req, res) => {
    try {
      await readerModel.findByIdAndDelete(req.params.id)

      res.json({ msg: 'Xóa thành công!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  addFollowing: async (req, res) => {
    try {
      const reader = await readerModel.findById(req.reader.id)
      if (!reader) return res.status(400).json({ msg: 'Reader không tồn tại.' })

      await readerModel.findOneAndUpdate(
        { _id: req.reader.id },
        {
          following: req.body.following
        }
      )

      return res.json({ msg: 'Đã thêm vào theo dõi' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body

      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.MAILING_SERVICE_CLIENT_ID
      })
      const { email_verified, email, name, picture } = verify.payload

      const password = email + process.env.GOOGLE_SECRET

      const passwordHash = await bcrypt.hash(password, 12)

      if (!email_verified)
        return res.status(400).json({ msg: 'Xác minh email không thành công.' })

      const reader = await readerModel.findOne({ email })

      if (reader) {
        const isMatch = await bcrypt.compare(password, reader.password)
        if (!isMatch) return res.status(400).json({ msg: 'Sai mật khẩu!' })

        const refresh_token = createRefreshToken({ id: reader._id })
        res.cookie('refreshtoken', refresh_token, {
          httpOnly: true,
          path: '/reader/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({ msg: 'Login success!' })
      } else {
        const newReader = new readerModel({
          name,
          email,
          password: passwordHash,
          avatar: picture
        })

        await newReader.save()

        const refresh_token = createRefreshToken({ id: newReader._id })
        res.cookie('refreshtoken', refresh_token, {
          httpOnly: true,
          path: '/reader/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({ msg: 'Login success!' })
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  facebookLogin: async (req, res) => {
    try {
      const { accessToken, userID } = req.body

      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`

      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => {
          return res
        })

      const { email, name, picture } = data

      const password = email + process.env.FACEBOOK_SECRET

      const passwordHash = await bcrypt.hash(password, 12)

      const reader = await readerModel.findOne({ email })

      if (reader) {
        const isMatch = await bcrypt.compare(password, reader.password)
        if (!isMatch) return res.status(400).json({ msg: 'Sai mật khẩu!' })

        const refresh_token = createRefreshToken({ id: reader._id })
        res.cookie('refreshtoken', refresh_token, {
          httpOnly: true,
          path: '/reader/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({ msg: 'Login success!' })
      } else {
        const newREader = new readerModel({
          name,
          email,
          password: passwordHash,
          avatar: picture.data.url
        })

        await newREader.save()

        const refresh_token = createRefreshToken({ id: newREader._id })
        res.cookie('refreshtoken', refresh_token, {
          httpOnly: true,
          path: '/reader/refresh_token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({ msg: 'Login success!' })
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getAllName: async (req, res) => {
    try {
      const allName = await readerModel.find()
      res.json({
        allName: allName.map((item) => ({
          id: item._id,
          name: item.name,
          avatar: item.avatar
        }))
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  }
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: '5m'
  })
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  })
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  })
}

module.exports = readerCtrl
