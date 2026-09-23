const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "DBMSproj@123",
    database: "employee_attendance",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;