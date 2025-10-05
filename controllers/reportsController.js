const path = require("path");
const dataService = require("../services/getDataForDay");
const AWS = require("aws-sdk");
const FileDownloaded = require("../models/filedownloaded");

// Serve the reports page
const getReportsPage = (req, res, next) => {
  res.sendFile(
    path.join(__dirname, "../", "public", "views", "reports.html")
  );
};

// Upload data to S3
function uploadToS3(data, fileName) {
  let s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
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

// Generate daily report
const dailyReports = async (req, res) => {
  try {
    const date = req.body.date;
    const expenses = await dataService.getDataForToday(date, req.user._id);
    return res.status(200).json({ expenses, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Generate monthly report
const monthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }
    const expenses = await dataService.getDataForMonth(month, req.user._id);
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Download daily expenses file
const downloadDailyReports = async (req, res) => {
  try {
    const date = req.query.date;
    const userId = req.user._id;
    if (!date || !userId) {
      return res
        .status(400)
        .json({ message: "required Date", success: false });
    }

    const expenses = await dataService.getDataForToday(date, req.user._id);
    const stringifyExpenses = JSON.stringify(expenses);
    const fileName = `Expense${userId}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(stringifyExpenses, fileName);

    // Save to filedownloaded collection
    await FileDownloaded.create({
      userId,
      filedownloadurl: fileUrl,
    });

    return res.status(200).json({ fileUrl, success: true });
  } catch (error) {
    console.log(error)
    res.status(500).json({ err: error, fileUrl: "", success: false });
  }
};

// Download monthly expenses file
const downloadMonthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    const userId = req.user._id;
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

// Fetch list of downloaded files
const downloadFiles = async (req, res) => {
  try {
    const files = await FileDownloaded.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .exec();

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