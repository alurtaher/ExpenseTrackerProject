const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");
const authenticatePremiumUser = require("../middleware/authenticatePremiumUser")
router.use(authenticatePremiumUser)

router.get("/getLeaderboardPage", leaderboardController.getLeaderboardPage);

router.get("/getLeaderboard", leaderboardController.getLeaderboard);

module.exports = router;