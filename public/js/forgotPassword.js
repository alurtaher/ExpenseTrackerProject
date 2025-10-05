const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://52.66.252.18";

axios.defaults.baseURL = API_BASE_URL;

async function sendMail() {
  try {
    const email = document.getElementById("email").value;
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    const res = await axios.post("/password/sendMail", { email });
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.error("Error sending reset link", error);
    alert(error.response?.data?.message || "Failed to send reset link");
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);