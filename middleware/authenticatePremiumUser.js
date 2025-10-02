const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token && req.query.token) {
      token = req.query.token;
    }

    const userData = jwt.verify(token, process.env.SECRET_KEY);

    // Use findById for mongoose
    const user = await User.findById(userData.userId);

    if (!user || !user.isPremiumUser) {
      return res.status(403).json({ message: "Access denied: Premium only" });
    }

    req.user = user; // attach user to request for future use
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};