const { Op } = require("sequelize");
const Expense = require("../models/expenseModel");

const getDataForToday = async (date, userId) => {
  try {
    const expenses = await Expense.findAll({
      where: { date: date, userId: userId },
    });
    return expenses;
  } catch (error) {
    return "Data not Valid";
  }
};

const getDataForMonth = async (month, userId) => {
  try {
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,
        },
        userId: userId,
      },
      raw: true,
    });
    return expenses;
  } catch (error) {
    return "Data not Valid";
  }
};

module.exports = {
  getDataForToday,
  getDataForMonth
};