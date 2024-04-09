const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Th1s1sP@ssw0rd",
    database: "express_nothing"
});

module.exports = db;