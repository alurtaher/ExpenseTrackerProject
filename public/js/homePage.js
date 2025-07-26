const form = document.getElementById("form1");
const categoryInput = document.getElementById("categoryBtn");
const descriptionInput = document.getElementById("descriptionValue");
const amountInput = document.getElementById("amountValue");
const table = document.getElementById("tbodyId");
const submitBtn = document.getElementById("submitBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardLink = document.getElementById("leaderboardLink");

let editingId = null; // Track edit mode

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const amount = amountInput.value.trim();
  const token = localStorage.getItem("token");

  if (!category || !description || !amount) {
    return alert("Please fill all fields");
  }

  const now = new Date();
  const date = `${now.getDate().toString().padStart(2, "0")}-${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${now.getFullYear()}`;

  try {
    if (editingId) {
      await axios.post(
        `http://localhost:3000/expense/editExpense/${editingId}`,
        { category, description, amount },
        { headers: { Authorization: token } }
      );
      editingId = null;
      submitBtn.textContent = "Add Expense";
    } else {
      await axios.post(
        "http://localhost:3000/expense/addExpense",
        { date, category, description, amount },
        { headers: { Authorization: token } }
      );
    }

    resetForm();
    refreshApp();
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
});

async function getAllExpenses() {
  const token = localStorage.getItem("token");
  table.innerHTML = ""; // Clear old data
  try {
    const res = await axios.get(
      "http://localhost:3000/expense/getAllExpenses",
      {
        headers: { Authorization: token },
      }
    );

    res.data.forEach((exp) => {
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
        </td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

table.addEventListener("click", async (e) => {
  const row = e.target.closest("tr");
  const id = row.querySelector("input[type='hidden']").value;
  const token = localStorage.getItem("token");

  if (e.target.classList.contains("delete")) {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(
          `http://localhost:3000/expense/deleteExpense/${id}`,
          {
            headers: { Authorization: token },
          }
        );
        refreshApp();
      } catch (err) {
        console.error(err);
        alert("Failed to delete expense.");
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

async function buyPremium() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      "http://localhost:3000/purchase/premiumMembership",
      {
        headers: { Authorization: token },
      }
    );

    if (res.data.isPremium) {
      return alert(res.data.message);
    }

    const { paymentSessionId, orderId } = res.data;
    const result = await Cashfree({ mode: "sandbox" }).checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.paymentDetails) {
      const confirmRes = await axios.post(
        `http://localhost:3000/purchase/updateTransactionStatus/${orderId}`,
        {},
        { headers: { Authorization: token } }
      );

      alert("Payment successful! You are now a premium member.");
      refreshApp();
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("Payment failed or was cancelled.");
  }
}

async function checkPremiumStatus() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get("http://localhost:3000/user/isPremiumUser", {
      headers: { Authorization: token },
    });

    if (res.data.isPremiumUser) {
      buyPremiumBtn.innerHTML = "👑 Premium Member";
      buyPremiumBtn.disabled = true;
      //reportsLink.removeAttribute("onclick");
      //leaderboardLink.removeAttribute("onclick");
      //leaderboardLink.setAttribute("href", "/premium/getLeaderboardPage");
      buyPremiumBtn.removeEventListener("click", buyPremium);
    }
  } catch (err) {
    console.log(err);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

function resetForm() {
  categoryInput.value = "";
  descriptionInput.value = "";
  amountInput.value = "";
}

function refreshApp() {
  getAllExpenses();
  checkPremiumStatus();
  resetForm();
  editingId = null;
  submitBtn.textContent = "Add Expense";
}

document.addEventListener("DOMContentLoaded", () => {
  refreshApp();
});

async function leaderboard() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: token },
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

buyPremiumBtn.addEventListener("click", buyPremium);
leaderboardLink.addEventListener("click", leaderboard);