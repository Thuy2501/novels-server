const router = require('express').Router()
const novelCtrl = require('../controllers/novelCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

router
  .route('/novels')
  .get(auth,authAdmin, novelCtrl.getNovels)
  .post(auth, novelCtrl.createNovel)

router.route('/user-novels').get(auth, novelCtrl.getUserNovels)

router
  .route('/novels/:id')
  .delete(auth, novelCtrl.deleteNovel)
  .put(auth, novelCtrl.updateNovel)


  //fontend
router.get('/novel-role', novelCtrl.getNovelsRole)
router.put('/novel-role/:id', novelCtrl.updateNovelStatus)

router.route('/chapter-novels/:id').put(auth, novelCtrl.updateChapterNovel)

router.patch('/follow-novel/:id', auth, novelCtrl.followNovel)

router.patch('/like-novel/:id', auth, novelCtrl.likesNovel)
router.get('/get-like-novel/:id', novelCtrl.getLikeNovel)

// router.patch('/comment-novel', auth, novelCtrl.commentNovel)
router.get('/follow/:id', novelCtrl.totleFollow)
router
  .route('/comment-novels-update/:id')
  .put(auth, novelCtrl.updateCommentNovel)

module.exports = router