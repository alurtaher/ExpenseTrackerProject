const path = require("path");
const User = require("../models/userModel");

exports.getLeaderboardPage = (req, res, next) => {
  res.sendFile(
    path.join(__dirname, "../", "public", "views", "leaderboard.html")
  );
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, totalExpenses: 1 })
      .sort({ totalExpenses: -1 })
      .lean();

    const result = users.map(user => ({
      name: user.name,
      amount: user.totalExpenses,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Server Error" });
  }
};