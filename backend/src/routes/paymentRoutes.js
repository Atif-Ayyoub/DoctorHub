const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/upload', authenticate, authorize('patient'), ctrl.upload.single('payment_file'), ctrl.uploadPayment);
router.get('/pending', authenticate, authorize('assistant'), ctrl.getPendingPayments);
router.get('/all', authenticate, authorize('assistant', 'doctor'), ctrl.getAllPayments);
router.patch('/:id/verify', authenticate, authorize('assistant', 'doctor'), ctrl.verifyPayment);
router.patch('/:id/reject', authenticate, authorize('assistant', 'doctor'), ctrl.rejectPayment);

module.exports = router;
