const Datastore = require('nedb');
const bcrypt = require('bcrypt');
const path = require('path');

const db = new Datastore({ filename: path.join(__dirname, '../data/users.db'), autoload: true });
const SALT_ROUNDS = 10;

class UserModel {
    add({ username, password }, callback) {
        bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
            if (err) return callback(err);
            db.insert({ username, password: hash }, (err, newDoc) => {
                if (err) return callback(err);
                callback(null, newDoc);
            });
        });
    }

    findByUsername(username, callback) {
        db.findOne({ username }, (err, user) => {
            if (err) return callback(err);
            callback(null, user);
        });
    }

    getAll(callback) {
        db.find({}, (err, users) => {
            if (err) return callback(err);
            callback(null, users);
        });
    }

    deleteById(id, callback) {
        db.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) return callback(err);
            db.persistence.compactDatafile();
            callback(null, numRemoved);
        });
    }
}

module.exports = new UserModel();