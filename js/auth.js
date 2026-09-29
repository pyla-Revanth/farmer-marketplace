/* ============================================================
   auth.js — Authentication Logic & Demo Logins
   ============================================================ */

let selectedRole = "customer";

function initRoleToggle() {
  const btns = document.querySelectorAll(".role-toggle button");
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      selectedRole = b.dataset.role;
    });
  });

  // Check URL param mode
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "farmer") {
    switchForm("register");
    const farmerBtn = document.querySelector('.role-toggle button[data-role="farmer"]');
    if (farmerBtn) {
      btns.forEach((x) => x.classList.remove("active"));
      farmerBtn.classList.add("active");
      selectedRole = "farmer";
    }
  }
}

function switchForm(which) {
  const loginPane = document.getElementById("loginPane");
  const regPane = document.getElementById("registerPane");
  const tabLogin = document.getElementById("tabLogin");
  const tabReg = document.getElementById("tabRegister");

  if (loginPane) loginPane.style.display = which === "login" ? "block" : "none";
  if (regPane) regPane.style.display = which === "register" ? "block" : "none";
  if (tabLogin) tabLogin.className = which === "login" ? "btn btn-primary" : "btn btn-outline";
  if (tabReg) tabReg.className = which === "register" ? "btn btn-primary" : "btn btn-outline";
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value;
  const users = readStore(STORE.users, []);

  const user = users.find((u) => u.email === email && u.password === pass);
  if (!user) {
    return showError("loginError", "Incorrect email or password. Please try again or use a demo login below.");
  }

  setCurrentUser(user);
  toast(`Welcome back, ${user.name}!`);
  setTimeout(() => {
    window.location.href = user.role === "farmer" ? "farmer-dashboard.html" : "index.html";
  }, 400);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone = document.getElementById("regPhone").value.trim();
  const pass = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  if (!name || !email || !phone || !pass || !confirm) {
    return showError("regError", "Please fill in all required fields.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return showError("regError", "Enter a valid email address.");
  }
  if (pass.length < 6) {
    return showError("regError", "Password must be at least 6 characters.");
  }
  if (pass !== confirm) {
    return showError("regError", "Passwords do not match.");
  }

  const users = readStore(STORE.users, []);
  if (users.some((u) => u.email === email)) {
    return showError("regError", "An account with this email already exists.");
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    password: pass,
    role: selectedRole,
    farm: selectedRole === "farmer" ? `${name}'s Organic Farm` : undefined
  };

  users.push(newUser);
  writeStore(STORE.users, users);
  setCurrentUser(newUser);

  toast(`🎉 Account created! Welcome, ${newUser.name}.`);
  setTimeout(() => {
    window.location.href = newUser.role === "farmer" ? "farmer-dashboard.html" : "index.html";
  }, 400);
}

/* Quick One-Click Demo Logins for Evaluation */
function quickLogin(email) {
  const users = readStore(STORE.users, []);
  const user = users.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
    toast(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
    setTimeout(() => {
      window.location.href = user.role === "farmer" ? "farmer-dashboard.html" : "index.html";
    }, 300);
  }
}
