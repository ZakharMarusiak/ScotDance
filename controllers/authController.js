const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

exports.renderLogin = (req, res) => {
    res.render('public/login', { title: 'Login' });
};

exports.handleLogin = (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '').trim();

    UserModel.findByUsername(username, (err, user) => {
        if (err || !user) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Invalid username or password.");
                    window.location.href = "/keyboard-cat-zone-login";
                </script>
            `);
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.send(`
                    <script>
                        localStorage.setItem("error", "Invalid username or password.");
                        window.location.href = "/keyboard-cat-zone-login";
                    </script>
                `);
            }

            const token = jwt.sign(
                { username: user.username },
                'SECRET_KEY',
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 3600000
            });

            return res.send(`
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
    res.send(`
        <script>
            localStorage.setItem("success", "You have been logged out");
            window.location.href = "/";
        </script>
    `);
};