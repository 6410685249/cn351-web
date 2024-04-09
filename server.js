const express = require('express');
const hbs = require('hbs');
const bp = require('body-parser');
const db = require('./db');
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
// const dotenv = require('dotenv');

let app = express();

// app.use(express.json());;
app.use(bp.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true })); // use for post method
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use('/static', express.static('static')); // activate static folder

// Session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// Middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user; // Pass user data to locals
    next();
});

// Route to Homepage
app.get('/', (req, res) => {
    // console.log(req.session);
    const user = req.session.user;
    res.render('home', { user });
});

// Route to about page
app.get('/about', (req, res) => {
    res.render('about');
});

// Route to login page
app.get('/aboutjohn', (req, res) => {
    res.render('login');
});

// Login post method
app.post('/aboutjohn', (req, res) => {
    const { uname, password } = req.body;
    
    const query = 'SELECT * FROM accounts WHERE username=? AND password=?';
    db.query(query, [uname, password], (err, results) => {
    if (err) {
        console.error('Query error:', err);
        return res.render('login', { errorMessage: 'Are you real John?' });
    }

    if (results.length > 0) {
        const user = results[0];
        req.session.user = user
        res.render('home', { user });
    } else {
        console.log('Login not successful');
        console.log(query);
        return res.render('login', { errorMessage: 'Are you real John?' });
    }
    console.log(results);
    });
});

app.get('/profile', (req, res) => {
    res.render('profile');
});



app.listen(8888, () => {
    console.log('Click URL: http://localhost:8888');
});