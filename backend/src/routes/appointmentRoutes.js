const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', authenticate, authorize('patient'), ctrl.bookAppointment);
router.get('/my', authenticate, authorize('patient'), ctrl.getMyAppointments);
router.delete('/:id', authenticate, authorize('patient'), ctrl.cancelAppointment);
router.get('/doctor', authenticate, authorize('doctor'), ctrl.getDoctorAppointments);
router.patch('/:id/complete', authenticate, authorize('doctor'), ctrl.completeAppointment);
router.get('/assistant', authenticate, authorize('assistant'), ctrl.getAssistantAppointments);

module.exports = router;
