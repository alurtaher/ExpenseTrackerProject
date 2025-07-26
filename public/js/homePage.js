const form = document.getElementById("form1");
const categoryInput = document.getElementById("categoryBtn");
const descriptionInput = document.getElementById("descriptionValue");
const amountInput = document.getElementById("amountValue");
const table = document.getElementById("tbodyId");
const submitBtn = document.getElementById("submitBtn");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = categoryInput.value;
  const description = descriptionInput.value;
  const amount = amountInput.value;
  const token = localStorage.getItem("token");

  if (!category || !description || !amount)
    return alert("Please fill all fields");

  const now = new Date();
  const date = `${now.getDate().toString().padStart(2, "0")}-${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${now.getFullYear()}`;

  try {
    await axios.post(
      "http://localhost:3000/expense/addExpense",
      {
        date,
        category,
        description,
        amount,
      },
      {
        headers: { Authorization: token },
      }
    );
    window.location.reload();
  } catch (err) {
    console.error(err);
  }
});

async function getAllExpenses() {
  const token = localStorage.getItem("token");
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
    if (confirm("Are you sure?")) {
      await axios.get(`http://localhost:3000/expense/deleteExpense/${id}`, {
        headers: { Authorization: token },
      });
      window.location.reload();
    }
  }

  if (e.target.classList.contains("edit")) {
    categoryInput.value = row.children[1].textContent;
    descriptionInput.value = row.children[2].textContent;
    amountInput.value = row.children[3].textContent.replace("₹", "");

    submitBtn.textContent = "Update";
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    newBtn.addEventListener(
      "click",
      async (event) => {
        event.preventDefault();
        await axios.post(
          `http://localhost:3000/expense/editExpense/${id}`,
          {
            category: categoryInput.value,
            description: descriptionInput.value,
            amount: amountInput.value,
          },
          {
            headers: { Authorization: token },
          }
        );
        window.location.reload();
      },
      { once: true }
    );
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
        {
          headers: { Authorization: token },
        }
      );
      alert("Payment successful! You are now a premium member.");
      localStorage.setItem("token", confirmRes.data.token);
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
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
    }
  } catch (err) {
    console.error(err);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", () => {
  getAllExpenses();
  checkPremiumStatus();
});

buyPremiumBtn.addEventListener("click", buyPremium);