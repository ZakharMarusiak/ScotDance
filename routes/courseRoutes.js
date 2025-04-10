const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.listCourses);
router.get('/:id', courseController.viewCourseDetails);

module.exports = router;