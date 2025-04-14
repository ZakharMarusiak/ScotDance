const CourseModel = require('../models/CourseModel');
const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');
const path = require('path');
const fs = require('fs');

exports.listCourses = async (req, res) => {
    try {
        const courses = await CourseModel.getAll();
        const now = new Date();
        const allClasses = await ClassModel.getAll();

        function formatDate(dateString) {
            const d = new Date(dateString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }

        courses.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        const formatted = courses.map(c => {
            const courseEnd = new Date(c.endDate);
            const isEnded = courseEnd < now;
            const hasClasses = allClasses.some(cls => cls.courseId === c._id);

            return {
                ...c,
                startDateFormatted: formatDate(c.startDate),
                endDateFormatted: formatDate(c.endDate),
                statusIsEnded: isEnded,
                isEmpty: !hasClasses
            };
        });

        res.render('admin/courses', {
            title: 'Admin – Manage Courses',
            courses: formatted
        });
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to load courses.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};

exports.toggleVisibility = async (req, res) => {
    const { id } = req.params;
    const { visible } = req.body;

    try {
        await CourseModel.toggleVisibility(id, visible === 'true');
        return res.send(`
            <script>
                localStorage.setItem("success", "Course visibility updated.");
                window.location.href = "/admin/courses";
            </script>
        `);
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to update course visibility.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;

        if (!req.file) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Course image is required.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "End date must be after the start date.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        const filename = Date.now() + '-' + req.file.originalname;
        const destinationPath = path.join(__dirname, '../public/photos/courses/', filename);
        fs.renameSync(req.file.path, destinationPath);

        const course = {
            name: name.trim(),
            startDate: start,
            endDate: end,
            image: 'photos/courses/' + filename,
            visible: false
        };

        await CourseModel.add(course);
        return res.send(`
            <script>
                localStorage.setItem("success", "Course created successfully.");
                window.location.href = "/admin/courses";
            </script>
        `);
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to create course.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const courseToDelete = await CourseModel.getById(id);
        if (courseToDelete?.image) {
            const imagePath = path.join(__dirname, '../public/', courseToDelete.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const classes = await ClassModel.getByCourseId(id);
        for (const cls of classes) {
            await RegistrationModel.deleteByClassId(cls._id);
            await ClassModel.deleteById(cls._id);
        }

        await RegistrationModel.deleteByCourseId(id, { type: 'course' });
        await CourseModel.deleteById(id);

        return res.send(`
            <script>
                localStorage.setItem("success", "Course deleted successfully.");
                window.location.href = "/admin/courses";
            </script>
        `);
    } catch {
        return res.send(`
            <script>
                localStorage.setItem("error", "Failed to delete course.");
                window.location.href = "/admin/courses";
            </script>
        `);
    }
};