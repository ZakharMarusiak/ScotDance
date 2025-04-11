const CourseModel = require('../models/CourseModel');
const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');

exports.listCourses = (req, res) => {
    res.render('admin/courses', { title: 'Admin – Manage Courses' });
};

exports.createCourse = (req, res) => {
    console.log('Start');
};

exports.deleteCourse = (req, res) => {
    console.log('Start');
};