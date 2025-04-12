const Datastore = require('nedb');
const db = new Datastore({ filename: './data/classes.db', autoload: true });

class ClassModel {
    async add(courseId, data) {
        return new Promise((resolve, reject) => {
            const classData = {
                ...data,
                courseId,
                day: new Date(data.day),
                startTime: data.startTime,
                endTime: data.endTime
            };

            db.insert(classData, (err, newDoc) => {
                if (err) reject(err);
                else resolve(newDoc);
            });
        });
    }

    async getByCourseId(courseId) {
        return new Promise((resolve, reject) => {
            db.find({ courseId }, (err, docs) => {
                if (err) reject(err);
                else {
                    docs.sort((a, b) => {
                        const aTime = new Date(`${new Date(a.day).toISOString().split('T')[0]}T${a.startTime}`);
                        const bTime = new Date(`${new Date(b.day).toISOString().split('T')[0]}T${b.startTime}`);
                        return aTime - bTime;
                    });
                    resolve(docs);
                }
            });
        });
    }

    async getById(classId) {
        return new Promise((resolve, reject) => {
            db.findOne({ _id: classId }, (err, doc) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    async updateById(classId, updatedData) {
        return new Promise((resolve, reject) => {
            db.update({ _id: classId }, { $set: updatedData }, {}, (err, numReplaced) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numReplaced);
            });
        });
    }


    async deleteById(classId) {
        return new Promise((resolve, reject) => {
            db.remove({ _id: classId }, {}, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
            });
        });
    }

}

module.exports = new ClassModel();