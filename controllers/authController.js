const UserModel = require('../models/UserModel');

exports.renderLogin = (req, res) => {
    res.render('public/login', { title: 'Login' });
};

exports.handleLogin = (req, res) => {
    res.send('Login logic goes here');
};

exports.logout = (req, res) => {
    res.send('Logout logic goes here');
};  