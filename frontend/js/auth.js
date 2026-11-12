import { login, register } from "./api.js";

function redirectIfLoggedIn() {
  const user = localStorage.getItem("hl_user");
  if (user) window.location.href = "dashboard.html";
}

function setUserAndGo(data) {
  localStorage.setItem("hl_user", JSON.stringify(data.user));
  localStorage.setItem("hl_token", data.token);
  window.location.href = "dashboard.html";
}

// ---- Login ----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  redirectIfLoggedIn();
  const errorEl = document.getElementById("error");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const data = await login(email, password);
      setUserAndGo(data);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

// ---- Register ----
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  redirectIfLoggedIn();
  const errorEl = document.getElementById("error");
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password !== password2) {
      errorEl.textContent = "رمز عبور و تکرار آن یکسان نیستند";
      return;
    }

    try {
      const data = await register(name, email, password);
      setUserAndGo(data);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}
