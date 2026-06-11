const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/users', authenticate, authorize('admin','super_admin'), ctrl.getUsers);
router.post('/doctors', authenticate, authorize('admin','super_admin'), ctrl.createDoctor);
router.post('/admins', authenticate, authorize('super_admin'), ctrl.createAdmin);
router.patch('/users/:id/deactivate', authenticate, authorize('admin','super_admin'), ctrl.deactivateUser);
router.patch('/users/:id/activate', authenticate, authorize('super_admin'), ctrl.activateUser);
router.get('/reports', authenticate, authorize('admin','super_admin'), ctrl.getReports);

module.exports = router;
