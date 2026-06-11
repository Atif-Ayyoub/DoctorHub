const router = require('express').Router();
const ctrl = require('../controllers/prescriptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', authenticate, authorize('doctor'), ctrl.createPrescription);
router.get('/my', authenticate, authorize('patient'), ctrl.getMyPrescriptions);
router.get('/patient/:patient_id', authenticate, authorize('doctor'), ctrl.getPatientPrescriptions);

module.exports = router;
