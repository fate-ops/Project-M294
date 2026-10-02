const loginForm = document.getElementById("login");
const email = document.getElementById("mail");
const passwd = document.getElementById("passwd");
const taskList = document.getElementById("task-list");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mailValue = email.value.trim();
  const passValue = passwd.value;

  const res = await fetch("http://localhost/auth/jwt/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: mailValue,
      password: passValue,
    }),
  });

  if (!res.ok) throw Error(`HTTP ${res.status}`);

  const data = await res.json();
  sessionStorage.setItem("token", data.token);

  await loadTasks();
});

async function loadTasks() {
  const token = sessionStorage.getItem("token");

  const tasksRes = await fetch("http://localhost/auth/jwt/tasks", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!tasksRes.ok) throw Error(`HTTP ${tasksRes.status}`);

  const tasks = await tasksRes.json();

  taskList.replaceChildren();

  tasks.forEach((task) => {
    const taskElement = document.createElement("li");
    const status = task.completed ? "Erledigt" : "Noch offen";

    taskElement.innerText = `${task.title} – ${status}`;
    taskList.appendChild(taskElement);
  });
}
