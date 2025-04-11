const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({ filename: path.join(__dirname, '../data/courses.db'), autoload: true });

class CourseModel {
    async getAll() {
        return new Promise((resolve, reject) => {
            db.find({}).sort({ startDate: 1 }).exec((err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            db.findOne({ _id: String(id) }, (err, doc) => {
                if (err) return reject(err);
                resolve(doc);
            });
        });
    }

    async add(course) {
        return new Promise((resolve, reject) => {
            db.insert(course, (err, newDoc) => {
                if (err) return reject(err);
                resolve(newDoc);
            });
        });
    }

    async deleteById(id) {
        return new Promise((resolve, reject) => {
            db.remove({ _id: String(id) }, {}, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
            });

        });

    }
}

module.exports = new CourseModel();