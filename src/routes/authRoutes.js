const express = require('express');
const router = express.Router();
const { login, register, verify } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/verify', authenticate, verify);

module.exports = router;

