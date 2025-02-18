const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

app.use('/api/auth', authRoutes);

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

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW()');
    res.json({ message: 'DB Connected!', time: rows[0]['NOW()'] });
  } catch (err) {
    res.status(500).json({ error: 'DB Connection Failed', details: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});