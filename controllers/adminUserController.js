const UserModel = require('../models/UserModel');

exports.listOrganisers = (req, res) => {
    UserModel.getAll((err, users) => {
        if (err) {
            return res.render('admin/users', {
                title: 'Manage Organisers',
                error: 'Failed to load organisers.',
                users: []
            });
        }

        res.render('admin/users', {
            title: 'Manage Organisers',
            users
        });
    });
};

exports.addOrganiser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('admin/users', {
            title: 'Manage Organisers',
            error: 'Username and password are required.',
            users: []
        });
    }

    // Check if user already exists
    UserModel.findByUsername(username, (err, existingUser) => {
        if (err) {
            return res.render('admin/users', {
                title: 'Manage Organisers',
                error: 'Error checking existing user.',
                users: []
            });
        }

        if (existingUser) {
            return res.render('admin/users', {
                title: 'Manage Organisers',
                error: 'Username already exists.',
                users: []
            });
        }

        UserModel.add({ username, password }, (err) => {
            if (err) {
                return res.render('admin/users', {
                    title: 'Manage Organisers',
                    error: 'Failed to add organiser.',
                    users: []
                });
            }

            res.redirect('/admin/organisers');
        });
    });
};

exports.deleteOrganiser = (req, res) => {
    const { id } = req.params;

    UserModel.deleteById(id, (err) => {
        if (err) {
            return res.render('admin/users', {
                title: 'Manage Organisers',
                error: 'Failed to delete organiser.',
                users: []
            });
        }

        res.redirect('/admin/organisers');
    });
};