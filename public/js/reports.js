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
const premiumStatus = document.getElementById("premiumStatus");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");
const reportsLink = document.getElementById("reportsLinkBtn");
const token = localStorage.getItem("token");
let isPremium = false;

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://52.66.252.18";

axios.defaults.baseURL = API_BASE_URL;
window.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "/";
  }
});

document.getElementById("homeBtn").addEventListener("click", () => {
  window.location.href = "/homePage";
});

async function getDailyReport(e) {
  e.preventDefault();
  try {
    const date = new Date(dateInput.value);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    let totalAmount = 0;

    const res = await axios.post(
      "/reports/dailyReports",
      { date: formattedDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    tbodyDaily.innerHTML = "";
    tfootDaily.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>₹${expense.amount}</td>`;
      tbodyDaily.appendChild(tr);
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td></td>
          <td></td>
          <td id="dailyTotal">Total</td>
          <td id="dailyTotalAmount">₹${totalAmount}</td>`;
    tfootDaily.appendChild(tr);
  } catch (error) {
    console.error("Error fetching daily report", error);
    alert("Unable to load daily report.");
  }
}

async function getMonthlyReport(e) {
  e.preventDefault();
  try {
    const month = new Date(monthInput.value);
    const formattedMonth = `${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    let totalAmount = 0;

    const res = await axios.post(
      "/reports/monthlyReports",
      { month: formattedMonth },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    tbodyMonthly.innerHTML = "";
    tfootMonthly.innerHTML = "";

    res.data.expenses.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>₹${expense.amount}</td>`;
      tbodyMonthly.appendChild(tr);
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td></td>
          <td></td>
          <td id="monthlyTotal">Total</td>
          <td id="monthlyTotalAmount">₹${totalAmount}</td>`;
    tfootMonthly.appendChild(tr);
  } catch (error) {
    console.error("Error fetching monthly report", error);
    alert("Unable to load monthly report.");
  }
}

async function getDayFile(e) {
  e.preventDefault();
  try {
    const date = new Date(dateInput.value);
    if (date == "Invalid Date") {
      alert("Please select a date");
      return;
    }
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const res = await axios.get(
      `/reports/dailyReports/download?date=${formattedDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 200) {
      const a = document.createElement("a");
      a.href = res.data.fileUrl;
      a.download = "daily_expense.csv";
      a.click();
      fetchDownloadedFiles();
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error("Error downloading daily file", error);
    alert("Failed to download daily report.");
  }
}

async function getMonthFile(e) {
  e.preventDefault();
  try {
    const month = new Date(monthInput.value);
    if (month == "Invalid Date") {
      alert("Please select a month");
      return;
    }
    const formattedMonth = `${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const res = await axios.get(
      `/reports/monthlyReports/download?month=${formattedMonth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 200) {
      const a = document.createElement("a");
      a.href = res.data.fileUrl;
      a.download = "monthly_expense.csv";
      a.click();
      fetchDownloadedFiles();
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error("Error downloading monthly file", error);
    alert("Failed to download monthly report.");
  }
}

async function fetchDownloadedFiles() {
  try {
    const res = await axios.get("/reports/downloadedfiles", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      populateDownloadsTable(res.data.files);
    } else {
      console.warn("Could not fetch files");
    }
  } catch (err) {
    console.error("Error fetching downloaded files", err);
    // alert("Unable to load downloaded files.");
  }
}

function populateDownloadsTable(files) {
  const tbody = document.getElementById("downloadsTbody");
  tbody.innerHTML = "";
  files.forEach((file, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>Report ${index + 1}</td>
          <td><a href="${
            file.filedownloadurl
          }" target="_blank" class="btn btn-sm btn-success">Download</a></td>`;
    tbody.appendChild(row);
  });
}

async function checkPremiumStatus() {
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: `Bearer ${token}` },
    });

    isPremium = res.data.isPremiumUser;

    if (isPremium) {
      buyPremiumBtn.textContent = "Premium Active";
      buyPremiumBtn.classList.replace("btn-success", "btn-secondary");
      premiumStatus.innerHTML =
        '<span class="premium-badge">You are a Premium User</span>';
    } else {
      premiumStatus.textContent = "You are not a premium user";
      premiumStatus.classList.add("text-danger");
    }
  } catch (err) {
    console.error("Error checking premium status", err);
  }
}

async function buyPremium() {
  try {
    const res = await axios.get("/purchase/premiumMembership", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.isPremium) {
      alert(res.data.message);
      return;
    }

    const { paymentSessionId, orderId } = res.data;

    const result = await Cashfree({ mode: "sandbox" }).checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.paymentDetails) {
      await axios.post(
        `/purchase/updateTransactionStatus/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Payment successful! You are now a premium member.");
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("Payment failed or was cancelled.");
  }
}

leaderboardLink.addEventListener("click", () => {
  if (!isPremium) {
    alert("You are not a premium user. Upgrade to access Leaderboard!");
  } else {
    window.location.href = `/premium/getLeaderboardPage?token=${token}`;
  }
});

reportsLink.addEventListener("click", () => {
  if (!isPremium) {
    alert(" You are not a premium user. Upgrade to access Reports!");
  } else {
    window.location.href = `/reports/getReportsPage?token=${token}`;
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

buyPremiumBtn.addEventListener("click", buyPremium);
dateShowBtn.addEventListener("click", getDailyReport);
monthShowBtn.addEventListener("click", getMonthlyReport);
dayDownloadBtn.addEventListener("click", getDayFile);
monthDownloadBtn.addEventListener("click", getMonthFile);

document.addEventListener("DOMContentLoaded", () => {
  fetchDownloadedFiles();
  checkPremiumStatus();
});