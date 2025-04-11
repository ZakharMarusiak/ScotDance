const UserModel = require('../models/UserModel');

exports.listOrganisers = (req, res) => {
    res.render('admin/users', { title: 'Admin – Manage Organisers' });
};

exports.addOrganiser = (req, res) => {
    console.log('Start');
};

exports.deleteOrganiser = (req, res) => {
    console.log('Start');
};