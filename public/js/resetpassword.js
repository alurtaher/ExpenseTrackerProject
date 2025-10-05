const resetPasswordBtn = document.getElementById("resetPasswordBtn");

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "http://52.66.252.18";

axios.defaults.baseURL = API_BASE_URL;

async function resetPassword() {
  try {
    const newPassword = document.getElementById("newPassword").value;
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }
    const currentUrl = window.location.href;
    const requestId = currentUrl.split("/").pop();

    const res = await axios.post("/password/resetPassword", {
      password: newPassword,
      requestId,
    });

    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.error("Error resetting password", error);
    alert(error.response?.data?.message || "Failed to reset password");
    window.location.reload();
  }
}

resetPasswordBtn.addEventListener("click", resetPassword);