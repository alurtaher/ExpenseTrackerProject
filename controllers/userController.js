const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");
const dotenv = require("dotenv");
dotenv.config();

function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.SECRET_KEY);
}

const isPremiumUser = (req, res, next) => {
  if (req.user.isPremiumUser) {
    return res.json({ isPremiumUser: true });
  } else {
    return res.json({ isPremiumUser: false });
  }
};

const getLoginPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
};

const postUserSignUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res
        .status(409)
        .send(
          `<script>alert('This email is already taken. Please choose another one.'); window.location.href='/'</script>`
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    res
      .status(200)
      .send(`<script>alert('User Created Successfully!'); window.location.href='/'</script>`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

const postUserLogin = async (req, res, next) => {
  const { loginEmail, loginPassword } = req.body;

  try {
    const user = await User.findOne({ email: loginEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't Exist!",
      });
    }

    const passwordMatch = await bcrypt.compare(loginPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect!",
      });
    }

    const token = generateAccessToken(user._id, user.email);
    res.status(200).json({
      success: true,
      message: "Login Successful!",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserLogin,
  postUserSignUp,
  isPremiumUser,
};