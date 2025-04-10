const Datastore = require('nedb');
const bcrypt = require('bcrypt');
const db = new Datastore({ filename: 'data/users.db', autoload: true });

const SALT_ROUNDS = 10;

class UserModel {
    addUser(userObj, callback) {
        // TODO: Add new organiser with unique username and hashed password
    }

    deleteById(id, callback) {
        // TODO: Delete organiser by ID
    }

    findByUsername(username, callback) {
        db.findOne({ username }, (err, user) => {
            if (err) return callback(err, null);
            return callback(null, user);
        });
    }

    getAll(callback) {
        // TODO: Get all organisers
    }
}

module.exports = new UserModel();