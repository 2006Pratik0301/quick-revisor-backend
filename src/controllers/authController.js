const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error.message?.toLowerCase().includes('connection terminated') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET';
    
    if (isConnectionError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings or use the connection pooler.',
        details: 'See server logs for connection troubleshooting steps'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await User.create(username, password);
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error.message?.toLowerCase().includes('connection terminated') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET';
    
    if (isConnectionError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings or use the connection pooler.'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verify = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error.message?.toLowerCase().includes('connection terminated') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET';
    
    if (isConnectionError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings or use the connection pooler.'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  verify
};

