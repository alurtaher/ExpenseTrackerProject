const path = require("path");
const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");
const bcrypt = require("bcrypt");
const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;
const API_URL = "http://localhost:3000"

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.forgotPasswordPage = async (req, res, next) => {
  try {
    res.status(200).sendFile(path.join(__dirname, "../", "public", "views", "forgotPassword.html"));
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const requestId = uuidv4();

    // Find user by email
    const recipientUser = await User.findOne({ email: email });

    if (!recipientUser) {
      return res.status(404).json({ message: "Please provide the registered email!" });
    }

    // Create reset request document
    const resetRequest = new ResetPassword({
      _id: requestId,
      isActive: true,
      userId: recipientUser._id,
    });
    await resetRequest.save();

    // Setup SendInBlue email client
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.RESET_PASSWORD_API_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
      email: process.env.SENDER_EMAIL,
      name: "Taher Basha",
    };
    const receivers = [{ email: email }];

    await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Link Below",
      htmlContent: `<h3>Hi! We got the request from you for reset the password. Here is the link below >>></h3>
          <a href="${API_URL}/password/resetPasswordPage/${requestId}">Click Here</a>`,
      params: {
        requestId: requestId,
      },
    });

    return res.status(200).json({
      message: "Link for reset the password is successfully sent to your Mail Id!",
    });
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "Failed to send password reset email" });
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, "../", "public", "views", "resetPassword.html"));
  } catch (error) {
    console.log(error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password, requestId } = req.body;

    const resetEntry = await ResetPassword.findOne({ _id: requestId, isActive: true });

    if (!resetEntry) {
      return res.status(409).json({ message: "Link already used or expired!" });
    }

    const hashed = await hashPassword(password);

    // Update user's password
    await User.findByIdAndUpdate(resetEntry.userId, { password: hashed });

    // Mark reset request inactive
    await ResetPassword.findByIdAndUpdate(requestId, { isActive: false });

    return res.status(200).json({ message: "Successfully changed password!" });
  } catch (err) {
    console.log(err);
    return res.status(409).json({ message: "Failed to change password!" });
  }
};