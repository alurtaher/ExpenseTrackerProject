const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const User = require('../models/userModel.js')
const FileDownloaded = sequelize.define("fileDownloaded", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  filedownloadurl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

User.hasMany(FileDownloaded, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
FileDownloaded.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

module.exports= FileDownloaded;