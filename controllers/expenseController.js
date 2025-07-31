const path = require("path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../utils/database");

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "homePage.html"));
};

exports.addExpense = async (req, res, next) => {
  let t;
  try {
    const { date, category, description, amount } = req.body;
    const userId = req.user.id;
    t = await sequelize.transaction();

    const createdExpense = await Expense.create(
      {
        date,
        category,
        description,
        amount,
        userId,
      },
      { transaction: t }
    );

    await User.increment("totalExpenses", {
      by: parseFloat(amount),
      where: { id: userId },
      transaction: t,
    });
    await t.commit();
    res.status(200).redirect("/homePage");
  } catch (err) {
    await t.rollback();
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const pageNo = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    console.log("pages " + pageNo + "Limit is " + limit);
    //If wanted by Pages
    if (pageNo && limit) {
      const offset = (pageNo - 1) * limit;
      const totalExpenses = await Expense.count({
        where: { userId: req.user.id },
      });
      const totalPages = Math.ceil(totalExpenses / limit);
      const expenses = await Expense.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
      });
      return res.json({ expenses: expenses, totalPages: totalPages });
    }

    //Else all the remaining Data
    const expenses = await Expense.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // show latest first
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ message: "Error in fetching expenses" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  let t;

  try {
    t = await sequelize.transaction();

    const expense = await Expense.findOne(
      { where: { id: expenseId, userId } },
      { transaction: t }
    );

    console.log("Expense ID is " + expenseId, " UserId is " + userId);

    if (!expense) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    const amountToDeduct = parseFloat(expense.amount);

    // Delete expense with transaction
    await Expense.destroy(
      { where: { id: expenseId, userId } },
      { transaction: t }
    );

    // Decrement user totalExpenses with transaction
    await User.decrement("totalExpenses", {
      by: amountToDeduct,
      where: { id: userId },
      transaction: t,
    });

    await t.commit(); //  Commit after both operations succeed
    res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    if (t) await t.rollback(); // Rollback on error
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

exports.editExpense = async (req, res) => {
  const { category, description, amount } = req.body;
  const expenseId = req.params.id;
  const userId = req.user.id;

  let t;

  try {
    t = await sequelize.transaction();

    // Step 1: Get the old expense (to calculate difference)
    const oldExpense = await Expense.findOne(
      { where: { id: expenseId, userId } },
      { transaction: t }
    );

    if (!oldExpense) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    const oldAmount = parseFloat(oldExpense.amount);
    const newAmount = parseFloat(amount);
    const difference = newAmount - oldAmount;

    // Step 2: Update the expense
    await Expense.update(
      { category, description, amount: newAmount },
      { where: { id: expenseId, userId }, transaction: t }
    );

    // Step 3: Adjust totalExpenses if amount changed
    if (difference !== 0) {
      await User.increment("totalExpenses", {
        by: difference,
        where: { id: userId },
        transaction: t,
      });
    }

    await t.commit();
    res.status(200).json({ message: "Edited Successfully" });
  } catch (err) {
    if (t) await t.rollback();
    console.error("Error updating expense:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};
