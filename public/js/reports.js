const dateInput = document.getElementById("date");
const dateShowBtn = document.getElementById("dateShowBtn");
const tbodyDaily = document.getElementById("tbodyDailyId");
const tfootDaily = document.getElementById("tfootDailyId");

const monthInput = document.getElementById("month");
const monthShowBtn = document.getElementById("monthShowBtn");
const tbodyMonthly = document.getElementById("tbodyMonthlyId");
const tfootMonthly = document.getElementById("tfootMonthlyId");
const dayDownloadBtn = document.getElementById("dayDownloadBtn");
const monthDownloadBtn = document.getElementById("monthDownloadBtn");
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://3.109.211.67"; //  AWS IP

axios.defaults.baseURL = API_BASE_URL;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

async function getDailyReport(e) {
  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const date = new Date(dateInput.value);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    let totalAmount = 0;
    const res = await axios.post(
      "/reports/dailyReports",
      {
        date: formattedDate,
      },
      { headers: { Authorization: token } }
    );

    tbodyDaily.innerHTML = "";
    tfootDaily.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;

      const tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");
      tbodyDaily.appendChild(tr);

      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(expense.date));

      const td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(expense.category));

      const td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(expense.description));

      const td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(expense.amount));

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });

    const tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");
    tfootDaily.appendChild(tr);

    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");

    td3.setAttribute("id", "dailyTotal");
    td4.setAttribute("id", "dailyTotalAmount");
    td3.appendChild(document.createTextNode("Total"));
    td4.appendChild(document.createTextNode(totalAmount));

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
  } catch (error) {
    console.log(error);
  }
}

async function getMonthlyReport(e) {
  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const month = new Date(monthInput.value);
    const formattedMonth = `${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    let totalAmount = 0;
    const res = await axios.post(
      "/reports/monthlyReports",
      {
        month: formattedMonth,
      },
      { headers: { Authorization: token } }
    );

    tbodyMonthly.innerHTML = "";
    tfootMonthly.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;

      const tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");
      tbodyMonthly.appendChild(tr);

      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(expense.date));

      const td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(expense.category));

      const td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(expense.description));

      const td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(expense.amount));

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });

    const tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");
    tfootMonthly.appendChild(tr);

    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");

    td3.setAttribute("id", "monthlyTotal");
    td4.setAttribute("id", "monthlyTotalAmount");
    td3.appendChild(document.createTextNode("Total"));
    td4.appendChild(document.createTextNode(totalAmount));

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
  } catch (error) {
    console.log(error);
  }
}

async function getDayFile(e) {
  try {
    e.preventDefault();
    const token = localStorage.getItem("token") + "";
    const date = new Date(dateInput.value);
    if (date == "Invalid Date") alert("First select the date");
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    const res = await axios.get(
      `/reports/dailyReports/download?date=${formattedDate}`,
      { headers: { Authorization: token } }
    );

    if (res) {
      if (res.status === 200) {
        var a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.download = "myexpense.csv";
        a.click();
      } else {
        throw new Error(res.data.message);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function getMonthFile(e) {
  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const month = new Date(monthInput.value);
    const formattedMonth = `${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const res = await axios.get(
      `/reports/monthlyReports/download?month=${formattedMonth}`,
      { headers: { Authorization: token } }
    );

    if (res) {
      if (res.status === 200) {
        var a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.download = "myexpense.csv";
        a.click();
      } else {
        throw new Error(res.data.message);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function populateDownloadsTable(files) {
  const tbody = document.getElementById("downloadsTbody");
  tbody.innerHTML = ""; // clear old data

  files.forEach((file, index) => {
    const row = document.createElement("tr");

    // File name
    const nameCell = document.createElement("td");
    nameCell.textContent = `Report ${index + 1}`;
    row.appendChild(nameCell);

    // Download button
    const actionCell = document.createElement("td");
    const downloadBtn = document.createElement("a");
    downloadBtn.href = file.filedownloadurl;
    downloadBtn.className = "btn btn-sm btn-success";
    downloadBtn.textContent = "Download";
    downloadBtn.setAttribute("target", "_blank");
    actionCell.appendChild(downloadBtn);

    row.appendChild(actionCell);
    tbody.appendChild(row);
  });
}

async function fetchDownloadedFiles() {
  try {
    const token = localStorage.getItem("token"); // or however you're storing it
    const res = await axios.get("/reports/downloadedfiles", {
      headers: { Authorization: token },
    });

    if (res.data.success) {
      populateDownloadsTable(res.data.files);
    } else {
      console.warn("Could not fetch files");
    }
  } catch (err) {
    console.error("Error fetching downloaded files", err);
  }
}

// Fetch on page load
window.addEventListener("DOMContentLoaded", fetchDownloadedFiles);

dateShowBtn.addEventListener("click", getDailyReport);
monthShowBtn.addEventListener("click", getMonthlyReport);
dayDownloadBtn.addEventListener("click", getDayFile);
monthDownloadBtn.addEventListener("click", getMonthFile);