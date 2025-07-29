const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require("sib-api-v3-sdk");
const dotenv = require("dotenv")
dotenv.config();

function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, "secret");
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

const postUserSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        res
          .status(409)
          .send(
            `<script>alert('This email is already taken. Please choose another one.'); window.location.href='/'</script>`
          );
      } else {
        bcrypt.hash(password, 10, async (err, hash) => {
          await User.create({
            name: name,
            email: email,
            password: hash,
          });
        });
        res
          .status(200)
          .send(
            `<script>alert('User Created Successfully!'); window.location.href='/'</script>`
          );
      }
    })
    .catch((err) => console.log(err));
};

const postUserLogin = (req, res, next) => {
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Something went Wrong!" });
        }
        if (result == true) {
          return res.status(200).json({
            success: true,
            message: "Login Successful!",
            token: generateAccessToken(user.id),
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Password Incorrect!",
          });
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User doesn't Exists!",
      });
    }
  });
};

const resetPasswordPage = async (req, res, next) => {
  try {
    return res.status(200)
      .sendFile(
        path.join(__dirname, "../", "public", "views", "resetPassword.html")
      );
  } catch (error) {
    console.log(error);
  }
};

const sendMail = async (req, res, next) => {
  try {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.RESET_PASSWORD_API_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: "taherbasha295@gmail.com",
      name: "A Taher Basha",
    };
    const receivers = [
      {
        email: req.body.email,
      },
    ];
    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Link Below",
      // htmlContent: `<h3>link for reset the password</h3>`,
    });
    return res.send(
      `<script>alert('Check your mails, Link for reset the password is successfully send on your Mail Id!'); window.location.href='/'</script>`
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserLogin,
  postUserSignUp,
  isPremiumUser,
  resetPasswordPage,
  sendMail,
};
