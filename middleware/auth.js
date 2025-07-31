const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log("Received token:", token);

    const decoded = jwt.verify(token, "secret");

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Authentication Error:", err);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = authenticate;