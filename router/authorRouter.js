const router = require('express').Router()
const authorCtrl = require('../controllers/authorCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

router
  .route('/author')
  .get(authorCtrl.getAuthor)
  .post(auth, authorCtrl.createAuthor)

router
  .route('/author/:id')
  .delete(auth,  authorCtrl.deleteAuthor)
  .put(auth, authorCtrl.updateAuthor)

module.exports = router
