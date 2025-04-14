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

    async findCourseLevelForClass(courseId, classId) {
        return new Promise((resolve, reject) => {
            db.find({ courseId, type: 'course', classId: null }, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }

    async deleteById(id) {
        return new Promise((resolve, reject) => {
            db.remove({ _id: id }, {}, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
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

    async deleteByCourseId(courseId, filter = {}) {
        return new Promise((resolve, reject) => {
            db.remove({ courseId, ...filter }, { multi: true }, (err, numRemoved) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(numRemoved);
            });
        });
    }

    async adjustOrDeleteCourseRegistrations(courseId, amountToSubtract) {
        return new Promise((resolve, reject) => {
            db.find({ courseId, type: 'course' }, async (err, docs) => {
                if (err) return reject(err);

                const promises = docs.map(reg => {
                    const newPrice = (reg.price || 0) - Math.abs(amountToSubtract);

                    if (newPrice <= 0) {
                        return new Promise((res, rej) => {
                            db.remove({ _id: reg._id }, {}, (err) => {
                                if (err) rej(err);
                                else res(1);
                            });
                        });
                    } else {
                        return new Promise((res, rej) => {
                            db.update({ _id: reg._id }, { $set: { price: newPrice } }, {}, (err) => {
                                if (err) rej(err);
                                else res(1);
                            });
                        });
                    }
                });

                await Promise.all(promises);
                db.persistence.compactDatafile();
                resolve(promises.length);
            });
        });
    }

    async removeClassFromCourseRegistration(registrationId, classId) {
        return new Promise((resolve, reject) => {
            db.findOne({ _id: registrationId }, async (err, doc) => {
                if (err || !doc) return reject(err || new Error('Registration not found'));

                if (!Array.isArray(doc.includedClassIds)) return resolve(false);

                const updated = doc.includedClassIds.filter(id => id !== classId);

                if (!updated.length) {
                    db.remove({ _id: registrationId }, {}, (err) => {
                        if (err) return reject(err);
                        resolve('deleted');
                    });
                } else {
                    try {
                        const cls = await ClassModel.getById(classId);
                        const classPrice = cls?.price || 0;
                        const newPrice = Math.max((doc.price || 0) - classPrice, 0);

                        db.update(
                            { _id: registrationId },
                            {
                                $set: {
                                    includedClassIds: updated,
                                    price: newPrice
                                }
                            },
                            {},
                            (err) => {
                                if (err) return reject(err);
                                resolve('updated');
                            }
                        );
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    async findClassRegistrationsByEmailAndCourse(email, courseId) {
        return new Promise((resolve, reject) => {
            db.find({ email, courseId, type: 'class' }, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }
}

module.exports = new RegistrationModel();