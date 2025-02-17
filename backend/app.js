const http = require('http');
const mysql = require('mysql2/promise');  // Cambiamos a mysql2
const fs = require('fs');
const path = require('path');

// Crear pool de conexiones para MariaDB
const pool = mysql.createPool({
  host: 'db',                   // Nombre del servicio en Docker
  user: 'chatuser',              // Usuario configurado en Docker
  password: 'chatpassword',      // Contraseña configurada en Docker
  database: 'chatdb'             // Base de datos creada automáticamente
});

// Inicializar la base de datos ejecutando schema.sql
const initDB = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql')).toString();
    await pool.query(schema);
    console.log('Database initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }
};

initDB();

const server = http.createServer(async (req, res) => {
  if (req.url === '/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
  } else if (req.url === '/test-db' && req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT NOW()');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'DB Connected!', time: rows[0]['NOW()'] }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'DB Connection Failed', details: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});