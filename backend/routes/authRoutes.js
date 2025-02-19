const express = require('express');
const { register, login, updateUser, getUser } = require('../controllers/authController');
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", authenticate, getUser);
router.put("/update-user", authenticate, updateUser);

module.exports = router;