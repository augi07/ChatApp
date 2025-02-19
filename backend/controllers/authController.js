const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/dbConfig');

const SECRET_KEY = 'your_secret_key';


exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'User successfully registered' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Successful login', token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let query = "UPDATE users SET name = ?, email = ? WHERE id = ?";
    let values = [name, email, userId];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
      values = [name, email, hashedPassword, userId];
    }

    await pool.query(query, values);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have middleware to decode the token
    const [users] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user data" });
  }
};