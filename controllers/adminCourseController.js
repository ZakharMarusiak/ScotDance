const CourseModel = require('../models/CourseModel');
const ClassModel = require('../models/ClassModel');
const RegistrationModel = require('../models/RegistrationModel');
const path = require('path');
const fs = require('fs');

exports.listCourses = async (req, res) => {
    try {
        const courses = await CourseModel.getAll();

        function formatDate(dateString) {
            const d = new Date(dateString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }

        courses.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        const formatted = courses.map(c => ({
            ...c,
            startDateFormatted: formatDate(c.startDate),
            endDateFormatted: formatDate(c.endDate)
        }));

        res.render('admin/courses', {
            title: 'Admin – Manage Courses',
            courses: formatted
        });
    } catch (err) {
        res.render('admin/courses', {
            title: 'Admin – Manage Courses',
            error: 'Failed to load courses.'
        });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        let imagePath = '';

        // Img
        if (req.file) {
            const filename = Date.now() + '-' + req.file.originalname;
            const destinationPath = path.join(__dirname, '../public/photos/courses/', filename);
            fs.renameSync(req.file.path, destinationPath);
            imagePath = 'photos/courses/' + filename;
        }

        const course = {
            name: name.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            image: imagePath
        };

        if (!req.file) {
            return res.render('admin/courses', {
                title: 'Admin – Manage Courses',
                error: 'Course image is required.'
            });
        }

        await CourseModel.add(course);
        res.redirect('/admin/courses');
    } catch (err) {
        res.render('admin/courses', {
            title: 'Admin – Manage Courses',
            error: 'Failed to create course.'
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const courseToDelete = await CourseModel.getById(id);
        if (courseToDelete?.image) {
            const imagePath = path.join(__dirname, '../public/', courseToDelete.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        const classes = await ClassModel.getByCourseId(id);

        for (const cls of classes) {
            await RegistrationModel.deleteByClassId(cls._id);
            await ClassModel.deleteById(cls._id);
        }

        await RegistrationModel.deleteByCourseId(id, { type: 'course' });
        await CourseModel.deleteById(id);

        res.redirect('/admin/courses');
    } catch (err) {
        res.render('admin/courses', {
            title: 'Admin – Manage Courses',
            error: 'Failed to delete course.'
        });
    }
};