const STORAGE_KEY = "daily-routine-planner-data";

const state = {
  tasks: [],
};

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.tasks = [];
      return;
    }
    const data = JSON.parse(raw);
    const today = getTodayKey();
    state.tasks = (data[today] || []).map((t) => ({
      id: t.id || crypto.randomUUID(),
      time: t.time || "09:00",
      title: t.title || "",
      category: t.category || "other",
      notes: t.notes || "",
      done: !!t.done,
    }));
    sortTasks();
  } catch {
    state.tasks = [];
  }
}

function saveTasks() {
  const today = getTodayKey();
  let data = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {}
  data[today] = state.tasks.map(({ id, time, title, category, notes, done }) => ({
    id,
    time,
    title,
    category,
    notes,
    done,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function sortTasks() {
  state.tasks.sort((a, b) => {
    const [ah, am] = a.time.split(":").map(Number);
    const [bh, bm] = b.time.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

function addTask(time, title, category, notes) {
  const task = {
    id: crypto.randomUUID(),
    time,
    title: title.trim(),
    category,
    notes: (notes || "").trim(),
    done: false,
  };
  state.tasks.push(task);
  sortTasks();
  saveTasks();
  render();
}

function updateTask(id, time, title, category, notes) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.time = time;
  task.title = title.trim();
  task.category = category;
  task.notes = (notes || "").trim();
  sortTasks();
  saveTasks();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function toggleDone(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}

function formatDisplayDate() {
  const d = new Date();
  const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  return d.toLocaleDateString("en-US", options);
}

const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const deleteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

function render() {
  const listEl = document.getElementById("routineList");
  const emptyEl = document.getElementById("emptyState");
  const dateEl = document.getElementById("dateDisplay");
  const taskCountEl = document.getElementById("taskCount");
  const completedCountEl = document.getElementById("completedCount");

  dateEl.textContent = formatDisplayDate();

  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;
  taskCountEl.textContent = `${total} task${total === 1 ? "" : "s"}`;
  completedCountEl.textContent = `${done} done`;

  if (state.tasks.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  listEl.innerHTML = state.tasks
    .map(
      (t) => `
    <li class="routine-item${t.done ? " done" : ""}" data-id="${t.id}">
      <button type="button" class="task-check" aria-label="${t.done ? "Mark incomplete" : "Mark complete"}">${t.done ? checkIcon : ""}</button>
      <span class="task-time">${t.time}</span>
      <div class="task-body">
        <div class="task-title">${escapeHtml(t.title)}</div>
        ${t.notes ? `<div class="task-notes">${escapeHtml(t.notes)}</div>` : ""}
      </div>
      <span class="task-category ${t.category}">${escapeHtml(t.category)}</span>
      <div class="task-actions">
        <button type="button" class="btn-icon edit-btn" aria-label="Edit">${editIcon}</button>
        <button type="button" class="btn-icon delete-btn" aria-label="Delete">${deleteIcon}</button>
      </div>
    </li>
  `
    )
    .join("");

  listEl.querySelectorAll(".task-check").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".routine-item").dataset.id;
      toggleDone(id);
    });
  });

  listEl.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".routine-item").dataset.id;
      openEditModal(id);
    });
  });

  listEl.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".routine-item").dataset.id;
      if (confirm("Delete this task?")) deleteTask(id);
    });
  });
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function openEditModal(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  document.getElementById("editId").value = task.id;
  document.getElementById("editTime").value = task.time;
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editCategory").value = task.category;
  document.getElementById("editNotes").value = task.notes || "";
  const modal = document.getElementById("editModal");
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
  document.getElementById("editTitle").focus();
}

function closeEditModal() {
  const modal = document.getElementById("editModal");
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("open");
}

document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const time = document.getElementById("taskTime").value;
  const title = document.getElementById("taskTitle").value;
  const category = document.getElementById("taskCategory").value;
  const notes = document.getElementById("taskNotes").value;
  addTask(time, title, category, notes);
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskNotes").value = "";
  document.getElementById("taskTitle").focus();
});

document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const time = document.getElementById("editTime").value;
  const title = document.getElementById("editTitle").value;
  const category = document.getElementById("editCategory").value;
  const notes = document.getElementById("editNotes").value;
  updateTask(id, time, title, category, notes);
  closeEditModal();
});

document.getElementById("cancelEdit").addEventListener("click", closeEditModal);
document.getElementById("modalBackdrop").addEventListener("click", closeEditModal);

loadTasks();
render();
