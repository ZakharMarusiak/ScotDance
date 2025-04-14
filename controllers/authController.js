const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

exports.renderLogin = (req, res) => {
    res.render('public/login', { title: 'Login' });
};

exports.handleLogin = (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '').trim();

    if (!username || !password) {
        return res.render('public/login', {
            title: 'Login',
            error: 'All fields are required.'
        });
    }

    UserModel.findByUsername(username, (err, user) => {
        if (err || !user) {
            return res.render('public/login', {
                title: 'Login',
                error: 'Invalid username or password.'
            });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.render('public/login', {
                    title: 'Login',
                    error: 'Invalid username or password.'
                });
            }

            const token = jwt.sign(
                { username: user.username },
                'SECRET_KEY',
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                secure: false, // true on production w/ HTTPS
                maxAge: 3600000
            });

            res.send(`
                <script>
                localStorage.setItem("success", "Welcome back!");
                window.location.href = "/admin/courses";
                </script>
            `);
        });
    });
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/?success=You have been logged out');
};