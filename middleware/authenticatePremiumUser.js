const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // adjust path to your User model
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    let token = req.header('Authorization')
    if (!token && req.query.token) {
      token = req.query.token;
    }

    console.log("Token Received in auth is " + token);
    const userData = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findByPk(userData.userId);
    // console.log("User is "+user.isPremiumUser)
    if (!user || !user.isPremiumUser) {
      return res.status(403).json({ message: "Access denied: Premium only" });
    }

    req.user = user; // attach user to request for future use
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};