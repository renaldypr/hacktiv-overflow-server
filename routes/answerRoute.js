const router = require('express').Router();
const { showAll, create, edit, vote } = require('../controllers/answerController');
const { auth } = require('../middlewares/auth');

router.get('/', showAll);
router.post('/', auth, create);
router.patch('/', auth, edit);
router.post('/:answerId/:statusVote', auth, vote)

module.exports = router;