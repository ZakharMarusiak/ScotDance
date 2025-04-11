const express = require('express');
const router = express.Router();
const adminClassController = require('../controllers/adminClassController');

router.get('/:courseId', adminClassController.listClasses);
router.get('/:courseId/add', adminClassController.renderAddForm);
router.post('/:courseId/add', adminClassController.createClass);
router.get('/:courseId/edit/:classId', adminClassController.renderEditForm);
router.post('/:courseId/edit/:classId', adminClassController.updateClass);
router.post('/:courseId/delete/:classId', adminClassController.deleteClass);
router.get('/:courseId/view-participants/:classId', adminClassController.viewParticipants);
router.post('/:courseId/participants/delete/:registrationId', adminClassController.deleteParticipant);

module.exports = router;