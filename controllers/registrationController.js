const ClassModel = require('../models/ClassModel');
const CourseModel = require('../models/CourseModel');
const RegistrationModel = require('../models/RegistrationModel');

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

function getStatus(day, startTime, endTime) {
    const now = new Date();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const start = new Date(day);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(day);
    end.setHours(endHour, endMin, 0, 0);

    if (now < start) return { status: 'upcoming', badgeClass: 'bg-success' };
    if (now >= start && now <= end) return { status: 'active', badgeClass: 'bg-warning text-dark' };
    return { status: 'ended', badgeClass: 'bg-secondary' };
}

exports.renderClassForm = async (req, res) => {
    const classId = req.params.id;

    try {
        const cls = await ClassModel.getById(classId);
        if (!cls) {
            return res.render('public/register', {
                title: 'Register for Class',
                error: 'Class not found.'
            });
        }

        const course = await CourseModel.getById(cls.courseId);
        const statusObj = getStatus(cls.day, cls.startTime, cls.endTime);

        if (statusObj.status !== 'upcoming') {
            return res.render('public/register', {
                title: 'Register for Class',
                error: 'This class is not available for booking.'
            });
        }

        res.render('public/register', {
            title: 'Register for Class',
            isClass: true,
            isCourse: false,
            formAction: `/register/class/${cls._id}`,
            courseId: course._id,
            courseName: course.name,
            className: cls.title,
            courseImage: course.image,
            dayFormatted: formatDate(cls.day),
            timeRange: `${cls.startTime} – ${cls.endTime}`,
            price: cls.price
        });
    } catch {
        res.render('public/register', {
            title: 'Register for Class',
            error: 'Failed to load class registration form.'
        });
    }
};

exports.handleClassRegistration = async (req, res) => {
    const classId = req.params.id;
    const { name, email, phone } = req.body;

    try {
        const cls = await ClassModel.getById(classId);
        if (!cls) {
            return res.render('public/register', {
                title: 'Register for Class',
                error: 'Class not found.'
            });
        }

        const course = await CourseModel.getById(cls.courseId);
        const statusObj = getStatus(cls.day, cls.startTime, cls.endTime);
        if (statusObj.status !== 'upcoming') {
            return res.render('public/register', {
                title: 'Register for Class',
                error: 'Cannot register for a class that is in the past or ongoing.'
            });
        }

        const existing = await RegistrationModel.findByClassOrCourse(email, cls.courseId, classId);
        if (existing) {
            return res.render('public/register', {
                title: 'Register for Class',
                error: 'You are already registered for this class or the associated course.'
            });
        }

        await RegistrationModel.add({
            type: 'class',
            classId,
            courseId: cls.courseId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            price: cls.price,
            registrationDate: new Date()
        });

        res.redirect(`/courses/${cls.courseId}?success=1`);
    } catch {
        res.render('public/register', {
            title: 'Register for Class',
            error: 'Registration failed. Please try again.'
        });
    }
};

exports.renderCourseForm = async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'Course not found.'
            });
        }

        const allClasses = await ClassModel.getByCourseId(courseId);
        const now = new Date();
        const futureClasses = allClasses.filter(cls => new Date(cls.day) >= now);

        if (!futureClasses.length) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'This course has no upcoming classes.'
            });
        }

        const endDate = new Date(course.endDate);
        if (now > endDate) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'This course has already ended.'
            });
        }

        res.render('public/register', {
            title: 'Register for Course',
            isCourse: true,
            isClass: false,
            formAction: `/register/course/${course._id}`,
            courseId: course._id,
            courseName: course.name,
            courseImage: course.image,
            startDateFormatted: formatDate(course.startDate),
            endDateFormatted: formatDate(course.endDate),
            price: futureClasses.reduce((acc, cls) => acc + cls.price, 0)
        });
    } catch {
        res.render('public/register', {
            title: 'Register for Course',
            error: 'Failed to load course registration form.'
        });
    }
};

exports.handleCourseRegistration = async (req, res) => {
    const courseId = req.params.id;
    const { name, email, phone } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'Course not found.'
            });
        }

        const allClasses = await ClassModel.getByCourseId(courseId);
        const now = new Date();
        const upcomingClasses = allClasses.filter(cls => new Date(cls.day) >= now);

        if (!upcomingClasses.length) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'This course has no upcoming classes.'
            });
        }

        const endDate = new Date(course.endDate);
        if (now > endDate) {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'This course has already ended.'
            });
        }

        const alreadyRegistered = await RegistrationModel.findByClassOrCourse(email, courseId, null);
        if (alreadyRegistered?.type === 'course') {
            return res.render('public/register', {
                title: 'Register for Course',
                error: 'You are already registered for this course.'
            });
        }

        await RegistrationModel.deleteByCourseId(courseId, { email, type: 'class' });

        await RegistrationModel.add({
            type: 'course',
            courseId,
            classId: null,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            price: upcomingClasses.reduce((acc, cls) => acc + cls.price, 0),
            includedClassIds: upcomingClasses.map(cls => cls._id), // нове поле
            registrationDate: new Date()
        });

        res.redirect(`/courses/${courseId}?success=course-upgraded`);
    } catch {
        res.render('public/register', {
            title: 'Register for Course',
            error: 'Registration failed. Please try again.'
        });
    }
};