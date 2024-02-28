const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose")
const User = require('./models/User.js') 


// PostgreSQL client setup
// const pool = new pg.Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'ass1back',
//     password: '231204almas',
//     port: 5432,
// });

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    };
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});
}

module.exports = initialize;

const authenticateUser = async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } else {
            return done(null, false, { message: 'No user with that email' });
        }
    } catch (e) {
        return done(e);
    }
}    
