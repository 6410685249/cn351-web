const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "john",
    password: "iAmJ0hnDoe007",
    database: "express_nothing"
});

module.exports = db;