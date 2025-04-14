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
            return res.send(`
                <script>
                    localStorage.setItem("error", "Class not found.");
                    window.location.href = "/courses";
                </script>
            `);
        }

        const course = await CourseModel.getById(cls.courseId);
        const statusObj = getStatus(cls.day, cls.startTime, cls.endTime);

        if (statusObj.status !== 'upcoming') {
            return res.send(`
                <script>
                    localStorage.setItem("error", "This class is not available for booking.");
                    window.location.href = "/courses/${cls.courseId}";
                </script>
            `);
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
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to load class registration form.");
                window.location.href = "/courses";
            </script>
        `);
    }
};

exports.handleClassRegistration = async (req, res) => {
    const classId = req.params.id;
    const { name, email, phone } = req.body;

    try {
        const cls = await ClassModel.getById(classId);
        if (!cls) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Class not found.");
                    window.location.href = "/courses";
                </script>
            `);
        }

        const course = await CourseModel.getById(cls.courseId);
        const statusObj = getStatus(cls.day, cls.startTime, cls.endTime);
        if (statusObj.status !== 'upcoming') {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Cannot register for a class that is in the past or ongoing.");
                    window.location.href = "/courses/${cls.courseId}";
                </script>
            `);
        }

        const existing = await RegistrationModel.findByClassOrCourse(email, cls.courseId, classId);
        if (existing) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "You are already registered for this class or the associated course.");
                    window.location.href = "/courses/${cls.courseId}";
                </script>
            `);
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

        return res.send(`
            <script>
                localStorage.setItem("success", "Successfully registered for the class.");
                window.location.href = "/courses/${cls.courseId}";
            </script>
        `);
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Registration failed. Please try again.");
                window.location.href = "/courses";
            </script>
        `);
    }
};

exports.renderCourseForm = async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course not found.");
                    window.location.href = "/courses";
                </script>
            `);
        }

        const allClasses = await ClassModel.getByCourseId(courseId);
        const now = new Date();
        const futureClasses = allClasses.filter(cls => new Date(cls.day) >= now);

        if (!futureClasses.length || new Date(course.endDate) < now) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "This course is not available for registration.");
                    window.location.href = "/courses";
                </script>
            `);
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
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to load course registration form.");
                window.location.href = "/courses";
            </script>
        `);
    }
};

exports.handleCourseRegistration = async (req, res) => {
    const courseId = req.params.id;
    const { name, email, phone } = req.body;

    try {
        const course = await CourseModel.getById(courseId);
        if (!course) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course not found.");
                    window.location.href = "/courses";
                </script>
            `);
        }

        const allClasses = await ClassModel.getByCourseId(courseId);
        const now = new Date();
        const upcomingClasses = allClasses.filter(cls => new Date(cls.day) >= now);

        if (!upcomingClasses.length || new Date(course.endDate) < now) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "This course is not available for registration.");
                    window.location.href = "/courses/${courseId}";
                </script>
            `);
        }

        const alreadyRegistered = await RegistrationModel.findByClassOrCourse(email, courseId, null);
        if (alreadyRegistered?.type === 'course') {
            return res.send(`
                <script>
                    localStorage.setItem("error", "You are already registered for this course.");
                    window.location.href = "/courses/${courseId}";
                </script>
            `);
        }

        const existingClassRegistrations = await RegistrationModel.findClassRegistrationsByEmailAndCourse(email, courseId);
        const hasClassRegistrations = existingClassRegistrations.length > 0;

        await RegistrationModel.deleteByCourseId(courseId, { email, type: 'class' });

        await RegistrationModel.add({
            type: 'course',
            courseId,
            classId: null,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            price: upcomingClasses.reduce((acc, cls) => acc + cls.price, 0),
            includedClassIds: upcomingClasses.map(cls => cls._id),
            registrationDate: new Date()
        });

        const successMessage = hasClassRegistrations
            ? "Successfully registered for the course. All previous class registrations were replaced."
            : "Successfully registered for the course.";

        return res.send(`
            <script>
                localStorage.setItem("success", "${successMessage}");
                window.location.href = "/courses/${courseId}";
            </script>
        `);
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Registration failed. Please try again.");
                window.location.href = "/courses";
            </script>
        `);
    }
};