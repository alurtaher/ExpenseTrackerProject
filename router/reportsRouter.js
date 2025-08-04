const express = require("express");
const router = express.Router();
const auth = require('../middleware/authenticatePremiumUser')
const reportsController = require("../controllers/reportsController");

//Middleware for Authentication
router.use(auth)

//Routes
router.get("/getReportsPage", reportsController.getReportsPage);
router.post("/dailyReports",reportsController.dailyReports);
router.post("/monthlyReports",reportsController.monthlyReports);
router.get("/dailyReports/download",reportsController.downloadDailyReports)
router.get("/monthlyReports/download",reportsController.downloadMonthlyReports)
router.get('/downloadedfiles',reportsController.downloadFiles);
module.exports = router;