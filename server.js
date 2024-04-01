const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.get('/', (req, res) => {
    res.send('Started Working, Express!');
});

app.listen(8888, () => {
    console.log('http://localhost:8888');
});