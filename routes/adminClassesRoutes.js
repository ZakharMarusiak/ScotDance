const express = require('express');
const router = express.Router();
const adminClassController = require('../controllers/adminClassController');

router.get('/:courseId', adminClassController.listClasses);
router.get('/:courseId/add', adminClassController.renderAddForm);
router.post('/:courseId/add', adminClassController.createClass);
router.get('/:courseId/edit/:classId', adminClassController.renderEditForm);
router.post('/:courseId/edit/:classId', adminClassController.updateClass);
router.post('/:courseId/delete/:classId', adminClassController.deleteClass);
router.get('/:courseId/registrations/:classId', adminClassController.viewRegistrations);
router.post('/:courseId/registrations/:classId/delete/:registrationId', adminClassController.deleteRegistration);

module.exports = router;