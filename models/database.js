const mysql = require("mysql2");

// 데이터베이스 연결
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "stay01346", // Replace with your MySQL password
    database: "testauth",   // Replace with your database name
});


module.exports = db;