const categoryItems = document.querySelectorAll(".dropdown-item");
const categoryInput = document.querySelector("#categoryInput");
const categoryBtn = document.querySelector("#categoryBtn");
const tbody = document.getElementById("tbodyId");
const reportsBtn = document.getElementById("reportsBtn")
const token = localStorage.getItem("token")
// const API_BASE_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:3000"
//     : "http://3.108.63.30/"; //  AWS IP

// axios.defaults.baseURL = API_BASE_URL;

categoryItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedCategory = e.target.getAttribute("data-value");
    categoryBtn.textContent = e.target.textContent;
    categoryInput.value = selectedCategory;
  });
});

async function getLeaderboard() {
  const token = localStorage.getItem("token")
  const res = await axios.get("/premium/getLeaderboard",{ headers: { Authorization: token } });
  let position = 1;
  res.data.forEach((user) => {
    let name = user.name;
    let amount = user.amount;

    // console.log(name, amount);
    let tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");

    tbody.appendChild(tr);

    let th = document.createElement("th");
    th.setAttribute("scope", "row");
    th.appendChild(document.createTextNode(position++));

    let td1 = document.createElement("td");
    td1.appendChild(document.createTextNode(name));

    let td2 = document.createElement("td");
    td2.appendChild(document.createTextNode(amount));

    tr.appendChild(th);
    tr.appendChild(td1);
    tr.appendChild(td2);
  });
}

document.addEventListener("DOMContentLoaded", getLeaderboard);