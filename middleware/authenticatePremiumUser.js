const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    let authHeader = req.header('Authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
    } else if (!authHeader && req.query.token) {
      token = req.query.token;
    } else {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const userData = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(userData.userId);

    if (!user || !user.isPremiumUser) {
      return res.status(403).json({ message: "Access denied: Premium only" });
    }

    req.user = user; // Attach user to request for future use
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};