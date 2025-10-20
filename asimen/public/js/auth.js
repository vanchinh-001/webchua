import { apiGet, apiPost } from "./api.js";

// ================== HÀM TIỆN ÍCH ==================
function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}
export function logout() {
  localStorage.removeItem("currentUser");
  alert("Đã đăng xuất!");
  window.location.href = "index.html";
}

// ================== ĐĂNG KÝ ==================
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  // support both legacy ids and current form ids
  const nameEl = document.getElementById("registerName") || document.getElementById("name");
  const emailEl = document.getElementById("registerEmail") || document.getElementById("email");
  const passwordEl = document.getElementById("registerPassword") || document.getElementById("password");
  const name = (nameEl?.value || '').trim();
  const email = (emailEl?.value || '').trim();
  const password = (passwordEl?.value || '').trim();

  try {
    const exist = await apiGet(`users?email=${encodeURIComponent(email)}`);
    if (Array.isArray(exist) && exist.length > 0) {
      alert("Email đã tồn tại!");
      return;
    }

    const newUser = await apiPost("users", { name, email, password, is_admin: false });
    saveUser(newUser);
    alert("Đăng ký thành công!");
    window.location.href = "login.html"; // redirect to login after register
  } catch (err) {
    console.warn('API register failed, falling back to localUsers', err);
    // offline fallback: save to localUsers
    try {
      const list = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const newUser = { id: Date.now(), name, email, password, is_admin: false };
      list.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(list));
      alert('Đăng ký offline thành công! Vui lòng đăng nhập.');
      window.location.href = 'login.html';
    } catch (e) {
      console.error('Failed to save offline user', e);
      alert('Không thể đăng ký lúc này. Thử lại sau.');
    }
  }
});

// ================== ĐĂNG NHẬP ==================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailEl = document.getElementById("loginEmail") || document.getElementById("email");
  const passwordEl = document.getElementById("loginPassword") || document.getElementById("password");
  const email = (emailEl?.value || '').trim();
  const password = (passwordEl?.value || '').trim();
  let user = null;
  try {
    const users = await apiGet(`users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    if (Array.isArray(users) && users.length > 0) {
      user = users[0];
    }
  } catch (err) {
    console.warn('API users lookup failed, will try localStorage fallback', err);
  }

  // Fallback: check localStorage single user (legacy) or localUsers array
  if (!user) {
    try {
      const single = JSON.parse(localStorage.getItem('user') || 'null');
      if (single && single.email === email && single.password === password) {
        user = { name: single.name, email: single.email, is_admin: false };
      }
      if (!user) {
        const list = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const found = list.find(u => u.email === email && u.password === password);
        if (found) user = found;
      }
    } catch (err) {
      console.error('Error reading local fallback users', err);
    }
  }

  if (!user) {
    alert("Sai email hoặc mật khẩu!");
    return;
  }

  saveUser(user);
  alert(`Xin chào ${user.name}!`);
  window.location.href = "index.html";
  
});
