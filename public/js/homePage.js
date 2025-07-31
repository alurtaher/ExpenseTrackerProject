const form = document.getElementById("form1");
const categoryInput = document.getElementById("categoryBtn");
const descriptionInput = document.getElementById("descriptionValue");
const amountInput = document.getElementById("amountValue");
const table = document.getElementById("tbodyId");
const submitBtn = document.getElementById("submitBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");
const reportsLink = document.getElementById("reportsLinkBtn");

let editingId = null;
let token = localStorage.getItem("token");

// Helper to create table row
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();

  if (!category || !description || !amount) {
    alert("Please fill all fields");
    return;
  }

  const now = new Date();
  const date = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}`;

  try {
    const url = editingId
      ? `http://localhost:3000/expense/editExpense/${editingId}`
      : "http://localhost:3000/expense/addExpense";

    const payload = editingId
      ? { category, description, amount }
      : { date, category, description, amount };

    await axios.post(url, payload, {
      headers: { Authorization: token }
    });

    editingId = null;
    submitBtn.textContent = "Add Expense";
    resetForm();
    refreshApp();
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
});

async function getAllExpenses() {
  try {
    const res = await axios.get("http://localhost:3000/expense/getAllExpenses", {
      headers: { Authorization: token }
    });

    const fragment = document.createDocumentFragment();
    res.data.forEach((exp) => fragment.appendChild(createExpenseRow(exp)));
    table.innerHTML = "";
    table.appendChild(fragment);
  } catch (err) {
    console.error("Failed to fetch expenses", err);
  }
}

table.addEventListener("click", async (e) => {
  const btn = e.target;
  const row = btn.closest("tr");
  if (!row) return;

  const id = row.querySelector("input[type='hidden']").value;

  if (btn.classList.contains("delete")) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await axios.delete(`http://localhost:3000/expense/deleteExpense/${id}`, {
        headers: { Authorization: token }
      });
      refreshApp();
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense.");
    }
  }

  if (btn.classList.contains("edit")) {
    categoryInput.value = row.children[1].textContent;
    descriptionInput.value = row.children[2].textContent;
    amountInput.value = row.children[3].textContent.replace("₹", "");

    editingId = id;
    submitBtn.textContent = "Update Expense";
  }
});

async function buyPremium() {
  try {
    const res = await axios.get("http://localhost:3000/purchase/premiumMembership", {
      headers: { Authorization: token }
    });

    if (res.data.isPremium) {
      alert(res.data.message);
      return;
    }

    const { paymentSessionId, orderId } = res.data;

    const result = await Cashfree({ mode: "sandbox" }).checkout({
      paymentSessionId,
      redirectTarget: "_modal"
    });

    if (result.paymentDetails) {
      await axios.post(
        `http://localhost:3000/purchase/updateTransactionStatus/${orderId}`,
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

async function checkPremiumStatus() {
  try {
    const res = await axios.get("http://localhost:3000/user/isPremiumUser", {
      headers: { Authorization: token }
    });

    if (res.data.isPremiumUser) {
      buyPremiumBtn.innerHTML = "👑 Premium Member";
      buyPremiumBtn.disabled = true;
      buyPremiumBtn.removeEventListener("click", buyPremium);
    }
  } catch (err) {
    console.log("Premium check failed", err);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

function resetForm() {
  form.reset();
  editingId = null;
  submitBtn.textContent = "Add Expense";
}

function refreshApp() {
  getAllExpenses();
  checkPremiumStatus();
}

async function leaderboard() {
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: token }
    });

    if (res.data.isPremiumUser) {
      window.location.href = `/premium/getLeaderboardPage?token=${token}`;
    } else {
      alert("Access Denied: Not a Premium User");
    }
  } catch (err) {
    alert("Access Denied: Only Premium Users allowed");
  }
}

async function report() {
  try {
    const res = await axios.get('/user/isPremiumUser',{
      headers: { Authorization: token }
    })
    if (res.data.isPremiumUser) {
      window.location.href = `/reports/getReportsPage?token=${token}`;
    } else {
      alert("Access Denied: Not a Premium User");
    }
  } catch (error) {
    alert("Access Denied: Only Premium Users allowed");
  }
}

// Event bindings
document.addEventListener("DOMContentLoaded", refreshApp);
buyPremiumBtn.addEventListener("click", buyPremium);
leaderboardLink.addEventListener("click", leaderboard);
reportsLink.addEventListener("click",report)