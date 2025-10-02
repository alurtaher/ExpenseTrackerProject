const path = require("path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "homePage.html"));
};

exports.addExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { date, category, description, amount } = req.body;
    const userId = req.user._id;

    const createdExpense = await Expense.create(
      [
        {
          date,
          category,
          description,
          amount,
          userId,
        }
      ],
      { session }
    );

    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalExpenses: parseFloat(amount) } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).redirect("/homePage");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const pageNo = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (pageNo && limit) {
      const offset = (pageNo - 1) * limit;

      const totalExpensesCount = await Expense.countDocuments({ userId });
      const totalPages = Math.ceil(totalExpensesCount / limit);

      const expenses = await Expense.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      return res.json({ expenses, totalPages });
    }

    const expenses = await Expense.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ message: "Error in fetching expenses" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expense = await Expense.findOne({ _id: expenseId, userId }).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const amountToDeduct = parseFloat(expense.amount);

    await Expense.deleteOne({ _id: expenseId, userId }).session(session);

    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalExpenses: -amountToDeduct } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

exports.editExpense = async (req, res) => {
  const { category, description, amount } = req.body;
  const expenseId = req.params.id;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldExpense = await Expense.findOne({ _id: expenseId, userId }).session(session);

    if (!oldExpense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const oldAmount = parseFloat(oldExpense.amount);
    const newAmount = parseFloat(amount);
    const difference = newAmount - oldAmount;

    await Expense.updateOne(
      { _id: expenseId, userId },
      { category, description, amount: newAmount }
    ).session(session);

    if (difference !== 0) {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { totalExpenses: difference } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Edited Successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating expense:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};