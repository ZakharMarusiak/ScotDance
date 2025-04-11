const jwt = require('jsonwebtoken');

const attachUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        res.locals.user = { username: decoded.username };
    } catch (err) {
        res.locals.user = null;
    }

    next();
};

module.exports = attachUser;