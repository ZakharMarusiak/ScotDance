const Datastore = require('nedb');
const db = new Datastore({ filename: 'data/registrations.db', autoload: true });

class RegistrationModel {
    async add(data) {
        return new Promise((resolve, reject) => {
            db.insert(data, (err, newDoc) => {
                if (err) return reject(err);
                resolve(newDoc);
            });
        });
    }

    async findByClassOrCourse(email, courseId, classId) {
        return new Promise((resolve, reject) => {
            db.findOne({
                email,
                $or: [
                    { type: 'class', classId },
                    { type: 'course', courseId }
                ]
            }, (err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        });
    }

    async findByClassId(classId) {
        return new Promise((resolve, reject) => {
            db.find({ classId }, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }

    async findExact(email, classId) {
        return new Promise((resolve, reject) => {
            db.findOne({ email, classId }, (err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        });
    }

    async deleteByClassId(classId) {
        return new Promise((resolve, reject) => {
            db.remove({ classId }, { multi: true }, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
            });
        });
    }

    async deleteByCourseId(courseId) {
        return new Promise((resolve, reject) => {
            db.remove({ courseId }, { multi: true }, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
            });
        });
    }

    async deleteById(id) {
        return new Promise((resolve, reject) => {
            db.remove({ _id: id }, {}, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile(); // опціонально: очищення
                resolve(numRemoved);
            });
        });
    }
}

module.exports = new RegistrationModel();