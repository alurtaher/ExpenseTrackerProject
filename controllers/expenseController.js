const path = require("path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "homePage.html"));
};

exports.addExpense = async (req, res, next) => {
  try {
    const { date, category, description, amount } = req.body;
    const userId = req.user.id;

    const createdExpense = await Expense.create({
      date,
      category,
      description,
      amount,
      userId,
    });

    await User.increment("totalExpenses", {
      by: parseFloat(amount),
      where: { id: userId },
    });

    res.status(200).redirect("/homePage");
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

exports.getAllExpenses = (req, res) => {
  Expense.findAll({ where: { userId: req.user.id } })
    .then((expenses) => {
      res.json(expenses);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    const expense = await Expense.findOne({ where: { id: expenseId, userId } });
    console.log("Expense ID is "+expenseId," UserId is "+userId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const amountToDeduct = parseFloat(expense.amount);

    await Expense.destroy({ where: { id: expenseId, userId } });

    await User.decrement("totalExpenses", {
      by: amountToDeduct,
      where: { id: userId },
    });

    res.status(200).json({message:"Deleted Successfully"});
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

exports.editExpense = async (req, res) => {
  const { category, description, amount } = req.body;
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    // Step 1: Get the old expense (to know the previous amount)
    const oldExpense = await Expense.findOne({ where: { id: expenseId, userId } });

    if (!oldExpense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const oldAmount = parseFloat(oldExpense.amount);
    const newAmount = parseFloat(amount);
    const difference = newAmount - oldAmount;

    // Step 2: Update the expense
    await Expense.update(
      { category, description, amount: newAmount },
      { where: { id: expenseId, userId } }
    );

    // Step 3: Adjust the totalExpenses by the difference
    if (difference !== 0) {
      await User.increment("totalExpenses", {
        by: difference,
        where: { id: userId },
      });
    }

    res.redirect("/homePage");
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};
