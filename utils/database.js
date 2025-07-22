const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "expense_tracker3",
  "root",
  "Taher004@",
  {
    dialect: "mysql",
    host: "localhost",
  }
);

module.exports = sequelize;