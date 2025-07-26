const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");
const authenticatePremiumUser = require("../middleware/authenticatePremiumUser")

router.get("/getLeaderboardPage",authenticatePremiumUser, leaderboardController.getLeaderboardPage);

router.get("/getLeaderboard",authenticatePremiumUser, leaderboardController.getLeaderboard);

module.exports = router;