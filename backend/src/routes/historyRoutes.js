const router = require('express').Router();
const ctrl = require('../controllers/historyController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', authenticate, authorize('patient'), ctrl.getMyHistory);
router.post('/reports', authenticate, authorize('patient'), ctrl.upload.single('report'), ctrl.uploadReport);
router.get('/:patient_id', authenticate, authorize('doctor'), ctrl.getPatientHistory);
router.post('/:patient_id', authenticate, authorize('doctor'), ctrl.addHistoryRecord);

module.exports = router;
