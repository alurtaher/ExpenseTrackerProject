const Sequelize = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.PROD_DB_HOSTNAME || "localhost",
    port: process.env.PROD_DB_PORT || 3306,
  }
);

module.exports = sequelize;