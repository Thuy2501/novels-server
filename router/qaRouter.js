const router = require('express').Router()
const qaCtrl = require('../controllers/qaCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

router.route('/qa').get(qaCtrl.getQA).post(auth, authAdmin,qaCtrl.createQA)

router.get('/qa_role', qaCtrl.getQARole)

router
  .route('/qa/:id')
  .delete(auth,authAdmin, qaCtrl.deleteQA)
  .put(auth,authAdmin, qaCtrl.updateQA)

module.exports = router
