const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, ctrl.sendMessage);
router.get('/', authenticate, ctrl.getMyMessages);
router.get('/threads', authenticate, ctrl.getThreads);
router.patch('/read', authenticate, ctrl.markThreadRead);

module.exports = router;
