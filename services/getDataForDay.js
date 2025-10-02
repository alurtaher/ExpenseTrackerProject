const Expense = require("../models/expenseModel");

const getDataForToday = async (date, userId) => {
  try {
    const expenses = await Expense.find({ date: date, userId: userId });
    return expenses;
  } catch (error) {
    return "Data not Valid";
  }
};

const getDataForMonth = async (month, userId) => {
  try {
    const regex = new RegExp(`-${month}-`);
    const expenses = await Expense.find({
      date: { $regex: regex },
      userId: userId,
    }).lean();
    return expenses;
  } catch (error) {
    return "Data not Valid";
  }
};

module.exports = {
  getDataForToday,
  getDataForMonth,
};