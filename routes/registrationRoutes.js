const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.get('/class/:id', registrationController.renderClassForm);
router.post('/class/:id', registrationController.handleClassRegistration);

router.get('/course/:id', registrationController.renderCourseForm);
router.post('/course/:id', registrationController.handleCourseRegistration);

module.exports = router;