const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
    }

    // Extract token after 'Bearer '
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log('Authentication Error:', err);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = authenticate;