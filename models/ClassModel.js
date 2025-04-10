const Datastore = require('nedb');
const db = new Datastore({ filename: 'data/classes.db', autoload: true });

class ClassModel {
    findByCourseId(courseId, callback) {
        // TODO: Get all classes for a given course
    }

    add(classData, callback) {
        // TODO: Validate and add a new class
    }

    updateById(id, newData, callback) {
        // TODO: Update class by ID (allow even if class is in the past)
    }

    deleteById(id, callback) {
        // TODO: Delete class and related registrations
    }
}

module.exports = new ClassModel();