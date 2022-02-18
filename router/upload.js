const router = require('express').Router()
const uploadImage = require('../middleware/uploadImage')
const uploadCtrl = require('../controllers/uploadCtrl')
const auth = require('../middleware/auth')

router.post('/upload_avatar', uploadImage, auth, uploadCtrl.uploadAvatar)
router.post('/upload_img', uploadImage, auth, uploadCtrl.uploadImg)
router.post('/destroy', auth, uploadCtrl.deleteImg)

module.exports = router