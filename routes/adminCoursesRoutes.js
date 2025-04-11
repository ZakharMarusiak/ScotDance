const express = require('express');
const router = express.Router();
const adminCourseController = require('../controllers/adminCourseController');
const upload = require('../middleware/uploadCourseImage');

router.get('/', adminCourseController.listCourses);
router.post('/add', upload.single('image'), adminCourseController.createCourse);
router.post('/delete/:id', adminCourseController.deleteCourse);

module.exports = router;