const router = require('express').Router()
const commentCtrl = require('../controllers/commentCtrl')
const auth = require('../middleware/auth')

router
  .route('/comment')
  .get(commentCtrl.getComment)
  .post(auth, commentCtrl.createComment)

router
  .route('/comment/:id')
  .get(commentCtrl.getCommentId)
  .put(auth, commentCtrl.updateComment)
  .delete(auth, commentCtrl.deleteComment)

module.exports = router