document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
  try {
    const newPassword = document.getElementById("newPassword").value;
    const currentUrl = window.location.href;
    const requestId = currentUrl.split("/").pop();

    const res = await axios.post("/password/resetPassword", {
      password: newPassword,
      requestId,
    });

    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Failed to reset password");
    window.location.reload();
  }
});