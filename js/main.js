const loginForm = document.getElementById("login");
const email = document.getElementById("mail");
const passwd = document.getElementById("passwd");
const taskList = document.getElementById("task-list");

const addForm = document.getElementById("create-task");
const textarea = document.getElementById("title");
const logoutBtn = document.getElementById("logout");

setLoggedIn(false);

function setLoggedIn(isLoggedIn) {
  loginForm.hidden = isLoggedIn;
  addForm.hidden = !isLoggedIn;
  taskList.hidden = !isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;
}

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("token");
  taskList.replaceChildren();
  addForm.reset();
  loginForm.reset();
  setLoggedIn(false);
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const mailValue = email.value.trim();
    const passValue = passwd.value;

    const res = await fetch("http://localhost/auth/jwt/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: mailValue,
        password: passValue,
      }),
    });

    if (!res.ok) {
      throw Error(`Anmeldung fehlgeschlagen: HTTP ${res.status}`);
    }

    const data = await res.json();
    sessionStorage.setItem("token", data.token);

    loginForm.reset();
    setLoggedIn(true);
    await loadTasks();
  } catch (error) {
    alert(error.message);
  }
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = textarea.value.trim();

  if (!title) {
    alert("Bitte gib einen Aufgabentitel ein.");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");

    const res = await fetch("http://localhost/auth/jwt/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        completed: false,
      }),
    });

    if (!res.ok) {
      throw Error(`Erstellen fehlgeschlagen: HTTP ${res.status}`);
    }

    addForm.reset();
    await loadTasks();
  } catch (error) {
    alert(error.message);
  }
});

async function loadTasks() {
  const token = sessionStorage.getItem("token");

  const res = await fetch("http://localhost/auth/jwt/tasks", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw Error(`Laden fehlgeschlagen: HTTP ${res.status}`);
  }

  const tasks = await res.json();

  taskList.replaceChildren();

  tasks.forEach((task) => {
    const taskElement = document.createElement("li");
    const status = task.completed ? "Erledigt" : "Noch offen";

    taskElement.innerText = `${task.title} – ${status} `;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.innerText = "Bearbeiten";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.innerText = "Löschen";
    delBtn.classList.add("delete-button");

    editBtn.addEventListener("click", () => {
      if (taskElement.querySelector("form")) return;

      const editForm = document.createElement("form");

      const titleLabel = document.createElement("label");
      titleLabel.innerText = "Titel: ";

      const editIn = document.createElement("textarea");
      editIn.id = `edit-title-${task.id}`;
      editIn.value = task.title;
      editIn.required = true;
      titleLabel.htmlFor = editIn.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `edit-completed-${task.id}`;
      checkbox.checked = task.completed;

      const completedLabel = document.createElement("label");
      completedLabel.innerText = "Erledigt";
      completedLabel.htmlFor = checkbox.id;

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.innerText = "Abbrechen";

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "submit";
      confirmBtn.innerText = "Speichern";

      editForm.append(
        titleLabel,
        editIn,
        checkbox,
        completedLabel,
        cancelBtn,
        confirmBtn,
      );

      taskElement.append(editForm);

      cancelBtn.addEventListener("click", () => {
        editForm.remove();
      });

      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = editIn.value.trim();

        if (!title) {
          alert("Bitte gib einen Aufgabentitel ein.");
          return;
        }

        try {
          const token = sessionStorage.getItem("token");

          const res = await fetch("http://localhost/auth/jwt/tasks", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: task.id,
              title: title,
              completed: checkbox.checked,
            }),
          });

          if (!res.ok) {
            throw Error(`Bearbeiten fehlgeschlagen: HTTP ${res.status}`);
          }

          await loadTasks();
        } catch (error) {
          alert(error.message);
        }
      });
    });

    delBtn.addEventListener("click", async () => {
      try {
        const token = sessionStorage.getItem("token");

        const res = await fetch(`http://localhost/auth/jwt/task/${task.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw Error(`Löschen fehlgeschlagen: HTTP ${res.status}`);
        }

        await loadTasks();
      } catch (error) {
        alert(error.message);
      }
    });

    taskElement.append(editBtn, delBtn);
    taskList.append(taskElement);
  });
}
