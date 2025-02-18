const http = require('http');
const mysql = require('mysql2/promise');  // Cambiamos a mysql2
const fs = require('fs');
const path = require('path');

// Crear pool de conexiones para MariaDB
const pool = mysql.createPool({
  host: 'db',
  user: 'chatuser',
  password: 'chatpassword',
  database: 'chatdb'
});

const waitForDB = async () => {
  let connected = false;
  while (!connected) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected!');
      connected = true;
    } catch (err) {
      console.log('⏳ Waiting for database...');
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

const initDB = async () => {
  await waitForDB();  // Esperar a que la base de datos esté lista

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql')).toString();
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (let statement of statements) {
      await pool.query(statement); // Ejecuta cada sentencia individualmente
    }

    console.log('✅ Database initialized successfully!');
  } catch (err) {
    console.error('❌ DB init error:', err);
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