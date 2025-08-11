const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://3.109.211.67"; //  AWS IP

axios.defaults.baseURL = API_BASE_URL;

async function sendMail() {
  try {
    const email = document.getElementById("email").value;
    const res = await axios.post("/password/sendMail", {
      email: email,
    });
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);