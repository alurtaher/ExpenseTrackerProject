const path = require("path");
const dataService = require("../services/getDataForDay");
const AWS = require("aws-sdk");
const FileDownloaded = require("../models/filedownloaded");

const getReportsPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "reports.html"));
};

function uploadToS3(data, fileName) {

  let s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3res) => {
      if (err) {
        reject(err);
      } else {
        resolve(s3res.Location);
      }
    });
  });
}

const dailyReports = async (req, res, next) => {
  try {
    const date = req.body.date;
    const expenses = await dataService.getDataForToday(date, req.user.id);
    return res.status(200).json({ expenses, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const monthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }
    const expenses = await dataService.getDataForMonth(month, req.user.id);
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const downloadDailyReports = async (req, res) => {
  try {
    const date = req.query.date;
    const userId = req.user.id;
    console.log("Date is" + date);
    if (!date || !userId) {
      return res
        .status(400)
        .json({ message: "required Date ", success: false });
    }

    const expenses = await dataService.getDataForToday(date, req.user.id);
    const stringifyExpenses = JSON.stringify(expenses);
    const fileName = `Expense${userId}/${new Date()}.txt`;

    const fileUrl = await uploadToS3(stringifyExpenses, fileName);

    //Save to filedownloaded table
    await FileDownloaded.create({
      userId,
      filedownloadurl: fileUrl,
    });

    return res.status(200).json({ fileUrl, success: true });
  } catch (error) {
    res.status(500).json({ err: error, fileUrl: "", success: false });
  }
};

const downloadMonthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    const userId = req.user.id;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }
    const expenses = await dataService.getDataForMonth(month, userId);
    const stringifyExpenses = JSON.stringify(expenses);

    const fileName = `Expense${userId}/${month}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(stringifyExpenses, fileName);

    await FileDownloaded.create({
      userId,
      filedownloadurl: fileUrl,
    });

    return res.status(200).json({ fileUrl, success: true });
  } catch (error) {
    res.status(500).json({ err: error, fileUrl: "", success: false });
  }
};

const downloadFiles = async (req, res) => {
  try {
    const files = await FileDownloaded.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]], // <-- Show latest first
    });

    return res.status(200).json({ success: true, files });
  } catch (error) {
    return res.status(500).json({ success: false, err: error });
  }
};

module.exports = {
  getReportsPage,
  dailyReports,
  monthlyReports,
  downloadDailyReports,
  downloadMonthlyReports,
  downloadFiles,
};
