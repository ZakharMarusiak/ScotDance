const Datastore = require('nedb');
const db = new Datastore({ filename: 'data/courses.db', autoload: true });

class CourseModel {
    getAll(callback) {
        // TODO: Get all active/upcoming courses that have classes
    }

    getById(id, callback) {
        // TODO: Get course by ID
    }

    add(courseData, callback) {
        // TODO: Validate and add a new course
    }

    deleteById(id, callback) {
        // TODO: Delete course and related classes and registrations
    }
}

module.exports = new CourseModel();