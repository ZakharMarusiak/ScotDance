const express = require('express');
const router = express.Router();
const adminCourseController = require('../controllers/adminCourseController');

router.get('/', adminCourseController.listCourses);
router.post('/', adminCourseController.createCourse);
router.post('/delete/:id', adminCourseController.deleteCourse);

module.exports = router;