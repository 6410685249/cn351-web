const express = require('express');
const app = express();
const hbs = require('hbs');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/about', (req, res) => {
    res.render('about')
});

app.listen(8888, () => {
    console.log('Click URL: http://localhost:8888');
});