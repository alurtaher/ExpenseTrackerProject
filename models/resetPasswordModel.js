const mongoose = require('mongoose');

const resetPasswordSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: false,
  },
}, {
  timestamps: true,
  _id: false,  // disable default ObjectId _id since you provide string _id
});

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

module.exports = ResetPassword;