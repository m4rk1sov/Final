const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose")
const User = require("./models/User.js") 
const mongodb = require("mongodb")



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

    // passport.serializeUser(function(user, done) {
    //     done(null, user.id);
    // });
    
    // passport.deserializeUser(function(id, done) {
    //     User.findById(id, function(err, user) {
    //         done(err, user);
    //     });
    // });
    
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});
}

module.exports = initialize;

