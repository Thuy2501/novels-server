const router = require('express').Router()
const readerCtrl = require('../controllers/readerCtrl')
const authCtrl = require('../controllers/auth')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

router.post('/register', authCtrl.register)

router.post('/activation', readerCtrl.activateEmail)

router.post('/login', authCtrl.login)
router.post('/login-ad',authCtrl.loginAD)

router.post('/refresh_token', authCtrl.generateAccessToken)

router.post('/forgot', readerCtrl.forgotPassword)

router.get('/all_name', readerCtrl.getAllName)  

router.post('/reset', auth, readerCtrl.resetPassword)

router.get('/infor', auth, readerCtrl.getReaderInfor)

router.get('/all_infor', auth, authAdmin, readerCtrl.getReaderAllInfor)

router.get('/logout', authCtrl.logout)

router.patch('/update', auth, readerCtrl.updateReader)

router.patch('/update/novel_save_page', auth, readerCtrl.updateNovelSavePage)

router.patch('/update_role/:id', auth, authAdmin, readerCtrl.updateReaderRole)

router.delete('/delete/:id', auth, authAdmin, readerCtrl.deleteReader)

router.patch('/add_follow', auth, readerCtrl.addFollowing)

// Social Login
router.post('/google_login', readerCtrl.googleLogin)

router.post('/facebook_login', readerCtrl.facebookLogin)

module.exports = router
