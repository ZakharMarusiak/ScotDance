const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');
const CourseModel = require('../models/CourseModel');

exports.listClasses = (req, res) => {
    res.render('admin/classes', { title: 'Admin – Manage Classes' });
};

exports.renderAddForm = (req, res) => {
    res.render('/class-form', { title: 'Add Class' });
};

exports.createClass = (req, res) => {
    console.log('Start');
};

exports.renderEditForm = (req, res) => {
    res.render('/class-form', { title: 'Edit Class' });
};

exports.updateClass = (req, res) => {
    console.log('Start');
};

exports.deleteClass = (req, res) => {
    console.log('Start');
};

exports.viewParticipants = (req, res) => {
    res.render('/participants', { title: 'Class Participants' });
};

exports.deleteParticipant = (req, res) => {
    console.log('Start');
};