const tbody = document.getElementById("tbodyId");
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

async function getLeaderboard() {
  try {
    const res = await axios.get("/premium/getLeaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    tbody.innerHTML = "";
    res.data.forEach((user, index) => {
      const position = index + 1;
      const tr = document.createElement("tr");

      // Position with badge
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      const positionBadge = document.createElement("span");
      positionBadge.className = `position-badge position-${
        position <= 3 ? position : "other"
      }`;
      positionBadge.textContent = position;
      th.appendChild(positionBadge);

      // Name
      const td1 = document.createElement("td");
      td1.textContent = user.name || "Unknown";

      // Total Expenses
      const td2 = document.createElement("td");
      td2.textContent = `₹${user.amount || 0}`;

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch leaderboard", err);
    // alert("Unable to load leaderboard.");
  }
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
        '<span class="premium-badge">🌟 You are a Premium User</span>';
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

document.addEventListener("DOMContentLoaded", () => {
  getLeaderboard();
  checkPremiumStatus();
});
