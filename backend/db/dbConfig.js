const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'db',
  user: 'chatuser',
  password: 'chatpassword',
  database: 'chatdb',
});

module.exports = pool;