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
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course not found.");
                    window.location.href = "/admin/courses";
                </script>
            `);
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
        if (!course) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course not found.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        res.render('admin/class-form', {
            title: 'Add Class',
            course
        });
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to load form.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};

exports.createClass = async (req, res) => {
    const { courseId } = req.params;
    const { title, description, location, day, startTime, endTime, price } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course not found.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        const error = await validateClassInput(course, { day, startTime, endTime, price });
        if (error) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "${error}");
                    window.location.href = "/admin/classes/${courseId}/add";
                </script>
            `);
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

        return res.send(`
            <script>
                localStorage.setItem("success", "Class created successfully.");
                window.location.href = "/admin/classes/${courseId}";
            </script>
        `);
    } catch {
        return res.render('admin/class-form', {
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
        if (!course || !cls) return res.send(`
            <script>
                localStorage.setItem("error", "Class or course not found.");
                window.location.href = "/admin/courses";
            </script>
            `);

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
        return res.send(`
            <script>
                localStorage.setItem("error", "Can not update class details.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};

exports.updateClass = async (req, res) => {
    const { courseId, classId } = req.params;
    const { title, description, location, day, startTime, endTime, price } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        const cls = await ClassModel.getById(classId);
        if (!course || !cls) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course or class not found.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        const error = await validateClassInput(course, { day, startTime, endTime, price }, classId);
        if (error) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "${error}");
                    window.location.href = "/admin/classes/${courseId}/edit/${classId}";
                </script>
            `);
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

        return res.send(`
            <script>
                localStorage.setItem("success", "Class updated successfully.");
                window.location.href = "/admin/classes/${courseId}";
            </script>
        `);
    } catch {
        return res.render('admin/classes/${courseId}', {
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
        if (!cls) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Class not found.");
                    window.location.href = "/admin/classes/${courseId}";
                </script>
            `);
        }

        await RegistrationModel.deleteByClassId(classId);

        const now = new Date();
        const classStart = new Date(cls.day);
        classStart.setHours(0, 0, 0, 0);

        if (classStart > now) {
            await RegistrationModel.adjustOrDeleteCourseRegistrations(courseId, cls.price);
        }

        await ClassModel.deleteById(classId);

        return res.send(`
            <script>
                localStorage.setItem("success", "Class and related registrations deleted.");
                window.location.href = "/admin/classes/${courseId}";
            </script>
        `);
    } catch {
        return res.render('admin/courses', {
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
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course or class not found.");
                    window.location.href = "/admin/courses";
                </script>
            `);
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
        return res.send(`
            <script>
                localStorage.setItem("error", "Unable to load registrations.");
                window.location.href = "/admin/courses";
            </script>
        `);
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
                return res.send(`
                    <script>
                        localStorage.setItem("success", "Course registration removed (no classes left)");
                        window.location.href = "${redirectTo}";
                    </script>
                `);
            } else if (result === 'updated') {
                return res.send(`
                    <script>
                        localStorage.setItem("success", "Class removed from course registration");
                        window.location.href = "${redirectTo}";
                    </script>
                `);
            } else {
                return res.send(`
                    <script>
                        localStorage.setItem("error", "Could not update course registration");
                        window.location.href = "${redirectTo}";
                    </script>
                `);
            }
        } else {
            await RegistrationModel.deleteById(registrationId);
            return res.send(`
                <script>
                    localStorage.setItem("success", "Registration deleted successfully");
                    window.location.href = "${redirectTo}";
                </script>
            `);
        }
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to delete registration");
                window.location.href = "${redirectTo}";
            </script>
        `);
    }
};