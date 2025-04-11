const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');

exports.renderClassForm = (req, res) => {
    res.render('public/register', { title: 'Register for Class' });
};

exports.handleClassRegistration = (req, res) => {
    res.send('Class registration logic goes here');
};

exports.renderCourseForm = (req, res) => {
    res.render('public/register', { title: 'Register for Course' });
};

exports.handleCourseRegistration = (req, res) => {
    res.send('Course registration logic goes here');
};