const loginForm = document.getElementById("login");
const email = document.getElementById("mail");
const passwd = document.getElementById("passwd");
const taskList = document.getElementById("task-list");

const addForm = document.getElementById("create-task");
const textarea = document.getElementById("title");

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

  loginForm.reset();

  const data = await res.json();
  sessionStorage.setItem("token", data.token);

  await loadTasks();
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const textareaValue = textarea.value.trim();
  if (!textareaValue) return;

  const token = sessionStorage.getItem("token");

  const tasksRes = await fetch("http://localhost/auth/jwt/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: textareaValue, completed: false }),
  });

  if (!tasksRes.ok) throw Error(`HTTP ${tasksRes.status}`);

  addForm.reset();

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

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.innerText = "Löschen";

    delBtn.addEventListener("click", async () => {
      const token = sessionStorage.getItem("token");

      const deleteElement = await fetch(
        `http://localhost/auth/jwt/task/${task.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!deleteElement.ok) throw Error(`HTTP ${deleteElement.status}`);

      await loadTasks();
    });

    taskList.append(taskElement);
    taskList.append(delBtn);
  });
}
