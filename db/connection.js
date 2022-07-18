const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: 'root',
  // Your MySQL password
  password: process.env.DB_PASSWORD,
  database: 'employee_db'
});

module.exports = db;
