const loginForm = document.getElementById("login");

const email = document.getElementById("mail");
const passwd = document.getElementById("passwd");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mailValue = email.value.trim();
  const passValue = passwd.value;

  const res = await fetch("http://localhost/auth/jwt/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mailValue, password: passValue }),
  });

  if (!res.ok) throw Error(`HTTP ${res.status}`);
  const data = await res.json();
  const token = sessionStorage.setItem("token", data.token);

  const tasks = await fetch("http://localhost/auth/jwt/tasks", {
    headers: { Authorization: `Bearer ${token}` },
  });
});
