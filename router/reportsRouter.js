const express = require("express");
const router = express.Router();
const auth = require('../middleware/authenticatePremiumUser')
const reportsController = require("../controllers/reportsController");
router.get("/getReportsPage", auth,reportsController.getReportsPage);
module.exports = router;