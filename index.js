if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Importing Libraries
const express = require("express");
const bcrypt = require("bcryptjs")
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const mongodb = require("mongodb")
const MongoStore = require('connect-mongo');
const User = require("./models/User"); 
const Blog = require("./models/Blog")
const axios = require("axios")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const bodyParser = require("body-parser")


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const app = express();

initializePassport(
    passport
    // async email => await User.findOne({ email: email }),
    // async id => await User.findById(id)
);


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    // secret: process.env.SESSION_SECRET,
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // Example: 30 days
        secure: process.env.NODE_ENV === "production", // Secure in production
        httpOnly: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.set('trust proxy', 1); // Trust first proxy
app.set('view engine', 'ejs')
app.set('views', './views')


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function(req, file, cb) {
        // You can use the original name or add a timestamp for uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage })

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
app.get('/', checkAuthenticated, async (req, res) => {
    try {
        const blogs = await Blog.find({}); 
        res.render("index.ejs", { blogs: blogs })
    } 
    catch (error) {
        console.error('Failed to fetch blogs', error);
        res.status(500).send('Error fetching blog posts');
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    const messages = req.flash();
    res.render("login.ejs", { messages });
});


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get('/create-blog', checkAuthenticated, checkAdminRole, async (req, res) => {
    try {
        const blogs = await Blog.find({}); // Fetch all blogs
        res.render('create-blog.ejs', { blogs: blogs }); // Pass blogs to the template
    } catch (error) {
        console.error('Failed to fetch blogs', error);
        res.status(500).send('Error fetching blog posts');
    }
});

app.get('/admin', checkAuthenticated, checkAdminRole, async (req, res) => {
    try {
        const blogs = await Blog.find({}); // Fetch all blogs
        res.render('admin.ejs', { blogs: blogs }); // Pass blogs to the template
    } catch (error) {
        console.error('Failed to fetch blogs', error);
        res.status(500).send('Error fetching blog posts');
    }
}) 

app.get('/blogs/:id', checkAuthenticated, async(req, res) => {
    try {
        const {id} = req.params
        const blogs = await Blog.findById(id)
        res.status(200).json(blogs)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

app.get('/edit-blog/:id', checkAuthenticated, checkAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        res.render("edit-blog", { blog: blog });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error accessing the database.");
    }
});

app.put('/blogs/:id', checkAuthenticated, checkAdminRole, async(req, res) => {
    console.log(req.body); // Log the request body to see what data is being received
    try {
        const {id} = req.params;
        const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true }); // Ensure updated document is returned
        if (!blog) {
            return res.status(404).json({ message: `Cannot find any blog with ID ${id}` });
        }
        res.redirect('/admin');
    } catch (error) {
        console.error(error); // Log the error to the console for debugging
        res.status(500).json({ message: error.message });
    }
});


app.post('/blog', checkAuthenticated, checkAdminRole, upload.single('image'), async(req, res) => {
    try {
        var obj = {
            title: req.body.title,
            description: req.body.description,
            image: {
                data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            }
        };
        const blog = await Blog.create(obj);
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }    
})

app.delete('/blogs/:id', checkAuthenticated, checkAdminRole, async(req, res) =>{
    try {
        const {id} = req.params
        const blog = await Blog.findByIdAndDelete(id)
        if(!blog){
            return res.status(404).json({message: `cannot find any blog with Id ${id}`})
        
        }
        
    } catch (error){
        res.status(500).json({message: error.message})
    }
})

app.delete("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get('/search-books', checkAuthenticated, async (req, res) => {
    const searchQuery = req.query.search;
    if (!searchQuery) {
        res.render('search-results', { books: [], error: 'Please provide a search query' });
        return;
    }

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`;

    try {
        const response = await axios.get(url);
        const books = response.data.docs.map(doc => ({
            title: doc.title,
            author: doc.author_name ? doc.author_name.join(', ') : "Unknown Author",
            year: doc.first_publish_year || "Unknown Year"
        }));
        res.render('search-results', { books: books });
    } catch (error) {
        console.error('Error fetching data from Open Library:', error);
        res.render('search-results', { books: [], error: 'Failed to fetch data' });
    }
});

app.get('/smartsheet-data', checkAuthenticated, async (req, res) => {
    const sheetId = process.env.SHEET_ID; 
    const config = {
        headers: { Authorization: process.env.SMARTSHEET_API } 
    };

    try {
        const response = await axios.get(`https://api.smartsheet.com/2.0/sheets/${sheetId}`, config);
        res.render('smartsheet-data', { data: response.data });
    } catch (error) {
        console.error('Error fetching data from Smartsheet:', error);
        res.status(500).send('Failed to fetch data');
    }
});

app.get('/holidays', checkAuthenticated, async (req, res) => {
    const apiKey = process.env.HOLIDAY_API; 
    const country = 'KZ'; 
    const year = 2023; 

    const url = `https://holidayapi.com/v1/holidays?pretty&key=${apiKey}&country=${country}&year=${year}`;

    try {
        const response = await axios.get(url);
        res.render('holidays', { holidays: response.data.holidays });
    } catch (error) {
        console.error('Error fetching data from Holiday API:', error);
        res.status(500).send('Failed to fetch data');
    }
});

// End Routes
  
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkAdminRole(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    // Respond with an error or redirect based on your application needs
    res.status(403).send('Access denied');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});