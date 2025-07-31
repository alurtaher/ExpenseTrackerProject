const express = require("express");
const router = express.Router();
const auth = require('../middleware/authenticatePremiumUser')
const reportsController = require("../controllers/reportsController");
router.use(auth)
router.get("/getReportsPage", reportsController.getReportsPage);
router.post("/dailyReports",reportsController.dailyReports);
router.post("/monthlyReports",reportsController.monthlyReports);
module.exports = router;