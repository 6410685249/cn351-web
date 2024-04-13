const express = require('express');
const hbs = require('hbs');
const bp = require('body-parser');
const db = require('./db');
const session = require('express-session');
// const dotenv = require('dotenv');

// Upload file
const multer  = require('multer')
const fs = require('fs');
// const upload = multer({ dest: 'uploads/'});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage }).single('file');

let app = express();

db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(express.json());
app.use(bp.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true })); // use for post method
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use('/static', express.static('static')); // activate static folder
app.use('/uploads', express.static('uploads')); // activate uploads folder
// app.use(multer());

// Session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user; // Pass user data to locals
    next();
});

/* Route */
// Homepage
app.get('/', (req, res) => {
    // console.log(req.session);
    const user = req.session.user;
    res.render('home', { user });
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

// Login page
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

app.post('/profile', (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log(err);
            res.render('profile', { message: 'File uploaded not successfully'});
        }
        else if (req.file === undefined) {
            res.render('profile', { message: 'Undefined file' })
        }
        else {
            res.render('profile', { message: 'Uploaded successfully'});
        }
    })
    console.log(res.body);
});

// Uploaded file page
app.get('/uploads', (req, res) => {
    fs.readdir('./uploads/', (err, files) => {
        if (err) {
            console.error('Error reading uploads directory: ', err);
            res.status(500).send('Internal Server Error');
        }
        else {
            console.log(res.json({ files }));
            res.render('uploaded', { files });
        }
    })
})

app.get('/uploads/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', fileName);
    res.sendFile(filePath);
});

app.listen(3000, () => {
    console.log('Click URL: http://localhost:3000');
});