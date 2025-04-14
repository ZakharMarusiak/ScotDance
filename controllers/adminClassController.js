const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');
const CourseModel = require('../models/CourseModel');

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function validateClassInput(course, data, ignoreClassId = null) {
    const { day, startTime, endTime, price } = data;

    if (!startTime || !endTime || startTime >= endTime) {
        return 'Start time must be before end time.';
    }

    const classDate = new Date(day);
    const courseStart = new Date(course.startDate);
    const courseEnd = new Date(course.endDate);

    if (isNaN(classDate)) return 'Invalid date provided.';
    if (classDate < courseStart || classDate > courseEnd) {
        return `Class date must be between ${formatDate(course.startDate)} and ${formatDate(course.endDate)}.`;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) return 'Price must be a valid number.';

    const sameDayClasses = await ClassModel.getByCourseId(course._id);
    const conflict = sameDayClasses.find(cls => {
        if (ignoreClassId && cls._id === ignoreClassId) return false;
        const sameDay = new Date(cls.day).toISOString().split('T')[0] === day;
        if (!sameDay) return false;
        return (
            (startTime >= cls.startTime && startTime < cls.endTime) ||
            (endTime > cls.startTime && endTime <= cls.endTime) ||
            (startTime <= cls.startTime && endTime >= cls.endTime)
        );
    });

    if (conflict) return 'This class overlaps with an existing one on the same day.';
    return null;
}

exports.listClasses = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.render('admin/classes', {
                title: 'Manage Classes',
                error: 'Course not found.'
            });
        }

        const startDateFormatted = formatDate(course.startDate);
        const endDateFormatted = formatDate(course.endDate);
        const classes = await ClassModel.getByCourseId(courseId);

        const formatted = classes.map(c => ({
            ...c,
            dayFormatted: formatDate(c.day),
            startFormatted: c.startTime,
            endFormatted: c.endTime
        }));

        res.render('admin/classes', {
            title: 'Manage Classes',
            course,
            startDateFormatted,
            endDateFormatted,
            classes: formatted
        });
    } catch {
        res.render('admin/classes', {
            title: 'Manage Classes',
            error: 'Failed to load class list.'
        });
    }
};

exports.renderAddForm = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) return res.redirect('/admin/courses');

        res.render('admin/class-form', {
            title: 'Add Class',
            course
        });
    } catch {
        res.redirect('/admin/courses');
    }
};

exports.createClass = async (req, res) => {
    const { courseId } = req.params;
    const { title, description, location, day, startTime, endTime, price } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.status(404).render('admin/class-form', {
                title: 'Add Class',
                error: 'Course not found.',
                course: { _id: courseId }
            });
        }

        const error = await validateClassInput(course, { day, startTime, endTime, price });
        if (error) {
            return res.render('admin/class-form', {
                title: 'Add Class',
                error,
                course
            });
        }

        await ClassModel.add(courseId, {
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            day,
            startTime,
            endTime,
            price: parseFloat(price)
        });

        res.redirect(`/admin/classes/${courseId}`);
    } catch {
        res.render('admin/class-form', {
            title: 'Add Class',
            error: 'Unexpected error occurred.',
            course: { _id: courseId }
        });
    }
};

exports.renderEditForm = async (req, res) => {
    const { courseId, classId } = req.params;

    try {
        const course = await CourseModel.getById(courseId);
        const cls = await ClassModel.getById(classId);
        if (!course || !cls) return res.redirect(`/admin/classes/${courseId}`);

        const dayISO = new Date(cls.day).toISOString().split('T')[0];

        res.render('admin/class-form', {
            title: 'Edit Class',
            course,
            class: {
                ...cls,
                day: dayISO
            }
        });
    } catch {
        res.redirect(`/admin/classes/${courseId}`);
    }
};

exports.updateClass = async (req, res) => {
    const { courseId, classId } = req.params;
    const { title, description, location, day, startTime, endTime, price } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        const cls = await ClassModel.getById(classId);
        if (!course || !cls) return res.redirect(`/admin/classes/${courseId}`);

        const error = await validateClassInput(course, { day, startTime, endTime, price }, classId);
        if (error) {
            return res.render('admin/class-form', {
                title: 'Edit Class',
                error,
                course,
                class: {
                    ...req.body,
                    _id: classId,
                    day
                }
            });
        }

        await ClassModel.updateById(classId, {
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            day: new Date(day),
            startTime,
            endTime,
            price: parseFloat(price)
        });

        res.redirect(`/admin/classes/${courseId}`);
    } catch {
        res.render('admin/class-form', {
            title: 'Edit Class',
            error: 'Unexpected error during update.',
            course,
            class: {
                ...req.body,
                _id: classId,
                day
            }
        });
    }
};

exports.deleteClass = async (req, res) => {
    const { courseId, classId } = req.params;

    try {
        const cls = await ClassModel.getById(classId);

        await RegistrationModel.deleteByClassId(classId);

        const now = new Date();
        const classStart = new Date(cls.day);
        classStart.setHours(0, 0, 0, 0);

        if (classStart > now) {
            await RegistrationModel.adjustOrDeleteCourseRegistrations(courseId, cls.price);
        }

        await ClassModel.deleteById(classId);

        res.redirect(`/admin/classes/${courseId}`);
    } catch {
        res.render('admin/classes', {
            title: 'Manage Classes',
            error: 'Failed to delete class and registrations.'
        });
    }
};

exports.viewRegistrations = async (req, res) => {
    const { courseId, classId } = req.params;

    function formatDateTime(date) {
        const d = new Date(date);
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    try {
        const cls = await ClassModel.getById(classId);
        const course = await CourseModel.getById(courseId);
        if (!cls || !course) {
            return res.render('admin/registrations', {
                title: 'Registrations',
                error: 'Course or class not found.'
            });
        }

        const direct = await RegistrationModel.findByClassId(classId);
        const courseLevelAll = await RegistrationModel.findCourseLevelForClass(courseId);
        const filteredCourseLevel = courseLevelAll.filter(r =>
            Array.isArray(r.includedClassIds) && r.includedClassIds.includes(classId)
        );

        const all = [...direct, ...filteredCourseLevel];

        const formattedRegistrations = all.map(r => ({
            ...r,
            registrationDateFormatted: formatDateTime(r.registrationDate),
            isCourseRegistration: r.type === 'course' && !r.classId
        }));

        res.render('admin/registrations', {
            title: `Registrations for "${cls.title}"`,
            registrations: formattedRegistrations,
            course,
            cls
        });
    } catch {
        res.render('admin/registrations', {
            title: 'Registrations',
            error: 'Unable to load registrations.'
        });
    }
};

exports.deleteRegistration = async (req, res) => {
    const { courseId, registrationId } = req.params;
    const { classId, partial } = req.query;

    const redirectTo = classId
        ? `/admin/classes/${courseId}/registrations/${classId}`
        : `/admin/courses`;

    try {
        if (partial === 'true') {
            const result = await RegistrationModel.removeClassFromCourseRegistration(registrationId, classId);

            if (result === 'deleted') {
                return res.redirect(`${redirectTo}?success=Course registration removed (no classes left)`);
            } else if (result === 'updated') {
                return res.redirect(`${redirectTo}?success=Class removed from course registration`);
            } else {
                return res.redirect(`${redirectTo}?error=Could not update course registration`);
            }
        } else {
            await RegistrationModel.deleteById(registrationId);
            return res.redirect(`${redirectTo}?success=Registration deleted successfully`);
        }
    } catch {
        return res.redirect(`${redirectTo}?error=Failed to delete registration`);
    }
};