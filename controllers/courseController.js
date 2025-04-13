const CourseModel = require('../models/CourseModel');
const ClassModel = require('../models/ClassModel');

function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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


function getCourseStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: 'upcoming', badgeClass: 'bg-success' };
    if (now >= start && now <= end) return { status: 'active', badgeClass: 'bg-warning text-dark' };
    return { status: 'ended', badgeClass: 'bg-secondary' };
}

exports.listCourses = async (req, res) => {
    try {
        const allCourses = await CourseModel.getAll();
        const allClasses = await ClassModel.getAll();

        const visibleCourses = allCourses
            .filter(course => {
                const hasClasses = allClasses.some(c => c.courseId === course._id);
                const courseEnd = new Date(course.endDate);
                const now = new Date();
                return hasClasses && courseEnd >= now;
            })
            .map(course => {
                const { status, badgeClass } = getCourseStatus(course.startDate, course.endDate);
                return {
                    ...course,
                    startDateFormatted: formatDate(course.startDate),
                    endDateFormatted: formatDate(course.endDate),
                    status,
                    badgeClass
                };
            });

        res.render('public/courses', {
            title: 'Courses',
            courses: visibleCourses
        });

    } catch (err) {
        res.render('public/courses', {
            title: 'Courses',
            error: 'Unable to load courses.'
        });
    }
};

exports.viewCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.render('public/course-details', {
                title: 'Course Not Found',
                error: 'Course not found.'
            });
        }

        const classes = await ClassModel.getByCourseId(courseId);

        const formattedCourse = {
            ...course,
            startDateFormatted: formatDate(course.startDate),
            endDateFormatted: formatDate(course.endDate),
            ...getCourseStatus(course.startDate, course.endDate)
        };

        const formattedClasses = classes.map(cls => {
            const statusObj = getStatus(cls.day, cls.startTime, cls.endTime);
            return {
                ...cls,
                dayFormatted: formatDate(cls.day),
                timeRange: `${cls.startTime} – ${cls.endTime}`,
                status: statusObj.status,
                badgeClass: statusObj.badgeClass,
                isUpcoming: statusObj.status === 'upcoming',
                isActive: statusObj.status === 'active',
                isEnded: statusObj.status === 'ended'
            };
        });

        const noClasses = formattedClasses.length === 0;
        const courseEnded = formattedCourse.status === 'ended';

        res.render('public/course-details', {
            title: 'Course Details',
            course: formattedCourse,
            classes: formattedClasses,
            showEnrollButton: !noClasses && !courseEnded,
            courseEnded,
            noClasses
        });

    } catch (err) {
        res.render('public/course-details', {
            title: 'Course Details',
            error: 'Unable to load course.'
        });
    }
};