const bcrypt = require('bcrypt');
const Datastore = require('nedb');
const db = new Datastore({ filename: 'data/users.db', autoload: true });

const SALT_ROUNDS = 10;

const newUser = {
    username: 'admin',
    password: 'admin123' // можеш замінити
};

db.findOne({ username: newUser.username }, (err, user) => {
    if (user) {
        console.log('User already exists');
        process.exit();
    }

    bcrypt.hash(newUser.password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) throw err;

        db.insert({ username: newUser.username, password: hashedPassword }, (err, doc) => {
            if (err) throw err;

            console.log(`✅ User "${doc.username}" created successfully`);
            process.exit();
        });
    });
});