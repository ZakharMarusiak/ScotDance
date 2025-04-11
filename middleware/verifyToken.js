const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/auth/keyboard-cat-zone-login');
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        res.locals.user = { username: decoded.username };
        next();
    } catch (err) {
        return res.redirect('/auth/keyboard-cat-zone-login');
    }
};

module.exports = verifyToken;