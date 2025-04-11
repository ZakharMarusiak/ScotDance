const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const attachUser = require('./middleware/attachUser');
const verifyToken = require('./middleware/verifyToken');

// Initialization
const app = express();

// Mustache + Views
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Global variables for mustache (alerts/messages)
app.use((req, res, next) => {
    res.locals.message = null;
    next();
});

app.use(attachUser);

// Routes
const indexRoutes = require('./routes/indexRoutes');
const courseRoutes = require('./routes/courseRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes');
const adminCoursesRoutes = require('./routes/adminCoursesRoutes');
const adminClassesRoutes = require('./routes/adminClassesRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');

app.use('/', indexRoutes);
app.use('/courses', courseRoutes);
app.use('/register', registrationRoutes);
app.use(authRoutes);
app.use('/admin/courses', verifyToken, adminCoursesRoutes);
app.use('/admin/classes', verifyToken, adminClassesRoutes);
app.use('/admin/organisers', verifyToken, adminUserRoutes);

module.exports = app;