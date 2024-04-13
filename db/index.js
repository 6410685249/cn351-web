const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "nothing-mysql-1",
    user: "root",
    password: "secret",
    database: "express_nothing"
});

module.exports = db;