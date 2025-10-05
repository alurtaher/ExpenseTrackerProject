const signUp = document.getElementById("signUp");
const signIn = document.getElementById("signIn");
const container = document.getElementById("container");
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// API Base URL
const BASEURL = window.location.hostname === "localhost" ? "http://localhost:3000" : "http://52.66.252.18";

axios.defaults.baseURL = BASEURL;

// Switch to Sign Up form overlay
signUp.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

// Switch to Sign In form overlay
signIn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// Login handler
async function login() {
  const loginDetails = {
    loginEmail: loginEmail.value,
    loginPassword: loginPassword.value,
  };

  try {
    const result = await axios.post(`${BASEURL}/user/login`, loginDetails);
    alert(result.data.message);
    localStorage.setItem("token", result.data.token);
    window.location.href = "/homePage";
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
}

loginBtn.addEventListener("click", login);