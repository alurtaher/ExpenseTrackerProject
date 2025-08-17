const form = document.getElementById("form1");
const categoryInput = document.getElementById("categoryBtn");
const descriptionInput = document.getElementById("descriptionValue");
const amountInput = document.getElementById("amountValue");
const dateInput = document.getElementById("dateValue");
const table = document.getElementById("tbodyId");
const submitBtn = document.getElementById("submitBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");
const reportsLink = document.getElementById("reportsLinkBtn");
const limitSelect = document.getElementById("limit");
const paginationUL = document.getElementById("paginationUL");
// Initialize variables
let editingId = null;
let token = localStorage.getItem("token");
let currentPage = 1;
let currentLimit = parseInt(limitSelect.value);

// Set today's date by default
dateInput.valueAsDate = new Date();

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://3.108.63.30"
    : "http://3.109.211.67"; //  AWS IP

axios.defaults.baseURL = API_BASE_URL;

function createExpenseRow(exp) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.category}</td>
        <td>${exp.description}</td>
        <td>₹${exp.amount}</td>
        <td>
          <button class="btn btn-sm btn-danger delete">Delete</button>
          <button class="btn btn-sm btn-secondary edit">Edit</button>
          <input type="hidden" value="${exp.id}">
        </td>`;
  return tr;
}

async function getAllExpenses(page = 1, limit = 5) {
  currentPage = page;
  currentLimit = limit;

  try {
    const res = await axios.get(
      `/expense/getAllExpenses?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: token },
      }
    );

    table.innerHTML = "";
    if (!res.data.expenses || res.data.expenses.length === 0) {
      if (currentPage > 1) getAllExpenses(currentPage - 1, currentLimit);
      return;
    }

    res.data.expenses.forEach((exp) => {
      const tr = createExpenseRow(exp);
      table.appendChild(tr);
    });

    // Pagination
    paginationUL.innerHTML = "";
    for (let i = 1; i <= res.data.totalPages; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === page ? " active" : "");
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = i;
      a.addEventListener("click", () => getAllExpenses(i, currentLimit));
      li.appendChild(a);
      paginationUL.appendChild(li);
    }
  } catch (err) {
    console.error("Failed to fetch expenses", err);
    alert("Unable to load expenses.");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();
  const date = dateInput.value;

  if (!category || !description || !amount || !date) {
    alert("Please fill all fields");
    return;
  }

  try {
    const url = editingId
      ? `/expense/editExpense/${editingId}`
      : "/expense/addExpense";
    const payload = editingId
      ? { category, description, amount }
      : { category, description, amount, date };

    await axios.post(url, payload, { headers: { Authorization: token } });

    editingId = null;
    submitBtn.textContent = "Add Expense";
    form.reset();
    dateInput.valueAsDate = new Date();
    getAllExpenses(currentPage, currentLimit);
  } catch (err) {
    alert("Error saving expense");
  }
});

table.addEventListener("click", async (e) => {
  const row = e.target.closest("tr");
  const id = row.querySelector("input").value;

  if (e.target.classList.contains("delete")) {
    if (confirm("Delete this expense?")) {
      try {
        await axios.delete(`/expense/deleteExpense/${id}`, {
          headers: { Authorization: token },
        });
        getAllExpenses(currentPage, currentLimit);
      } catch (err) {
        alert("Failed to delete expense");
      }
    }
  }

  if (e.target.classList.contains("edit")) {
    categoryInput.value = row.children[1].textContent;
    descriptionInput.value = row.children[2].textContent;
    amountInput.value = row.children[3].textContent.replace("₹", "");
    editingId = id;
    submitBtn.textContent = "Update Expense";
  }
});

buyPremiumBtn.addEventListener("click", buyPremium);

async function buyPremium() {
  try {
    const res = await axios.get("/purchase/premiumMembership", {
      headers: { Authorization: token },
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
        { headers: { Authorization: token } }
      );

      alert("Payment successful! You are now a premium member.");
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("Payment failed or was cancelled.");
  }
}

leaderboardLink.addEventListener("click", (e) => {
  if (leaderboardLink.disabled) return;
  window.location.href = `/premium/getLeaderboardPage?token=${token}`;
});

reportsLink.addEventListener("click", (e) => {
  if (reportsLink.disabled) return;
  window.location.href = `/reports/getReportsPage?token=${token}`;
});

limitSelect.addEventListener("change", () => {
  getAllExpenses(1, parseInt(limitSelect.value));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

document.addEventListener("DOMContentLoaded", () => {
  getAllExpenses(currentPage, currentLimit);
  checkPremiumStatus();
});

async function checkPremiumStatus() {
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: token },
    });

    const isPremium = res.data.isPremiumUser;

    if (isPremium) {
      buyPremiumBtn.textContent = "You are a Premium User";
      buyPremiumBtn.disabled = true;
      buyPremiumBtn.classList.replace("btn-success", "btn-secondary");
    } else {
      leaderboardLink.disabled = true;
      reportsLink.disabled = true;
      leaderboardLink.classList.add("btn-secondary");
      reportsLink.classList.add("btn-secondary");
      leaderboardLink.title = "Only premium users can access Leaderboard";
      reportsLink.title = "Only premium users can access Reports";

      leaderboardLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Access Denied: Premium users only");
      });

      reportsLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Access Denied: Premium users only");
      });
    }
  } catch (err) {
    console.error("Error checking premium status", err);
  }
}