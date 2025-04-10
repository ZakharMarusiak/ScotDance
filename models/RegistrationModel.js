const Datastore = require('nedb');
const db = new Datastore({ filename: 'data/registrations.db', autoload: true });

class RegistrationModel {
    registerToClass(data, callback) {
        // TODO: Validate and register to a single class
    }

    registerToCourse(courseId, userData, callback) {
        // TODO: Register to all upcoming classes in a course
    }

    getByClassId(classId, callback) {
        // TODO: Get all registrations for a specific class
    }

    checkDuplicate(classId, email, callback) {
        // TODO: Check if the user is already registered to this class
    }

    deleteById(id, callback) {
        // TODO: Delete a registration by ID
    }
}

module.exports = new RegistrationModel();