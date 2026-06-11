const router = require('express').Router();
const ctrl = require('../controllers/doctorController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public
router.get('/', ctrl.searchDoctors);

// Doctor profile
router.get('/profile/me', authenticate, authorize('doctor'), ctrl.getProfile);
router.put('/profile/me', authenticate, authorize('doctor'), ctrl.updateProfile);

// Clinics
router.post('/clinics', authenticate, authorize('doctor'), ctrl.createClinic);
router.get('/clinics/mine', authenticate, authorize('doctor'), ctrl.getClinics);
router.put('/clinics/:id', authenticate, authorize('doctor'), ctrl.updateClinic);
router.delete('/clinics/:id', authenticate, authorize('doctor'), ctrl.deleteClinic);

// Schedules
router.post('/schedules', authenticate, authorize('doctor'), ctrl.createSchedule);
router.get('/schedules/mine', authenticate, authorize('doctor'), ctrl.getSchedules);
router.put('/schedules/:id', authenticate, authorize('doctor'), ctrl.updateSchedule);

// Assistants
router.post('/assistants', authenticate, authorize('doctor'), ctrl.addAssistant);
router.get('/assistants/mine', authenticate, authorize('doctor'), ctrl.getAssistants);
router.delete('/assistants/:id', authenticate, authorize('doctor'), ctrl.removeAssistant);

router.get('/:id', ctrl.getDoctorById);

module.exports = router;
