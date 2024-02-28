if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Importing Libraries
const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const User = require('./models/User'); 
const axios = require("axios")

mongoose.connect('mongodb://127.0.0.1:27017/web2final', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));
    

const app = express();

initializePassport(
    passport
    // async email => await User.findOne({ email: email }),
    // async id => await User.findById(id)
);

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Login Route
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Registration Route
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email: email });

        if (userExists) {
            req.flash('error', 'A user with that email already exists.');
            res.redirect('/register');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: name,
                email: email,
                password: hashedPassword
            });
            await newUser.save();
            req.flash('success', 'Registration successful. You can now log in.');
            res.redirect("/login");
        }
    } catch (e) {
        console.log(e);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect("/register");
    }
});

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    const messages = req.flash();
    res.render("login.ejs", { messages });
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

app.delete("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

app.listen(3000);
