const router = require('express').Router()
const chapterCtrl = require('../controllers/chapterCtrl')
const auth = require('../middleware/auth')

router
  .route('/chapter')
  .get(chapterCtrl.getChap)
  .post(auth, chapterCtrl.createChapter)

router.put('/chapter-FE/:id', chapterCtrl.updateChapFE)
  
router.get('/chapter-role', chapterCtrl.getChapRole)

router
  .route('/chapter/:id')
  .delete(auth, chapterCtrl.deleteChapter)
  .put(auth, chapterCtrl.updateChapter)

module.exports = router