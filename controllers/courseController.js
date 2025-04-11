const CourseModel = require('../models/CourseModel');
const ClassModel = require('../models/ClassModel');

exports.listCourses = (req, res) => {
    res.render('public/courses', { title: 'Courses' });
};

exports.viewCourseDetails = (req, res) => {
    res.render('public/course-details', { title: 'Course Details' });
};  