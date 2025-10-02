const mongoose = require('mongoose');

const fileDownloadedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filedownloadurl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Cascade delete behavior is not automatic in MongoDB.
// To approximate Sequelize's onDelete 'CASCADE', implement middleware on User model for cleanup.

const FileDownloaded = mongoose.model('FileDownloaded', fileDownloadedSchema);

module.exports = FileDownloaded;