const express = require('express');
const hbs = require('hbs');
const bp = require('body-parser');
const db = require('./db');
const session = require('express-session');
const path = require('path');
const { spawn } = require('child_process');
// const dotenv = require('dotenv');

// Upload file
const multer  = require('multer')
const fs = require('fs');
const { hasSubscribers } = require('diagnostics_channel');
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

/* Middleware */
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

// Authentication function
const isAuthenticated = (req, res, next) => {
    if (req.session.user){
        return next();
    }
    res.redirect('/aboutjohn');
}

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
    
    const query = `SELECT * FROM accounts WHERE username=? AND password='${password}'`;
    db.query(query, [uname], (err, results) => {
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

app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

app.post('/profile', isAuthenticated, (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log(err);
            res.render('profile', { message: 'File uploaded not successfully.'});
        }
        else if (req.file === undefined) {
            res.render('profile', { message: 'Please select file.' });
        }
        else {
            res.render('profile', { message: 'Uploaded successfully.'});
        }
    })
});

// Uploaded file page
app.get('/uploads', (req, res) => {
    fs.readdir('./uploads/', (err, files) => {
        if (err) {
            console.error('Error reading uploads directory: ', err);
            res.status(500).send('Internal Server Error');
        }
        else {
            console.log({ files });
            res.render('uploaded', { files })
        }    
    })
})

// run file on url
app.get('/uploads/:filename', (req, res) => {
    console.log('Hello1');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    console.log('Hello2');

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File ${filePath} does not exist.`);
            return res.status(404).send('File not found');
        }

        // Check file extension
        const extname = path.extname(filePath);
        if (extname !== '.js') {
            console.error(`File ${filePath} is not a JavaScript file.`);
            return res.status(403).send('Forbidden');
        }

        // Execute the file using child_process.spawn
        const child = spawn('node', [filePath]);

        // Capture stdout and stderr
        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if (code === 0) {
                res.status(200).send(`File executed successfully.\n\nstdout:\n${stdout}`);
            } else {
                res.status(500).send(`Error executing file.\n\nstderr:\n${stderr}`);
            }
        });
    });
});

var server = app.listen(3000, () => {
    var host = "localhost";
    var port = server.address().port;
    console.log('Click URL: http://' + host + ':' + port + '/');
});
