const router = require('express').Router();
const { showAll, create, erase, edit, login, loginFB } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

router.get('/', showAll);
router.post('/', create);
router.delete('/', auth, erase);
router.patch('/', auth, edit);
router.post('/login', login);
router.post('/loginFB', loginFB);

module.exports = router;