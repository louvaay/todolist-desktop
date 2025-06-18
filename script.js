const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  // Jangan pakai localStorage untuk splash
  document.getElementById("splashScreen").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  updateDateDisplay(new Date());
  loadTasksForDate(getCurrentDateKey());
});


// DOM ELEMENTS
const dateText = document.getElementById("dateText");
const dayText = document.getElementById("dayText");
const monthText = document.getElementById("monthText");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const progressFill = document.getElementById("progressFill");
const finishBtn = document.getElementById("finishBtn");
const historySelect = document.getElementById("historySelect");

// INIT
const currentDate = new Date();
updateDateDisplay(currentDate);
loadTasksForDate(getCurrentDateKey());
updateHistoryDropdown();

// EVENTS
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addTask();
});

finishBtn.addEventListener("click", () => {
  const key = getCurrentDateKey();
  localStorage.setItem(`${key}-finished`, "true");
  alert("Todya's done 🎉");

  taskInput.disabled = true;
  addBtn.disabled = true;
  finishBtn.disabled = true;
  finishBtn.style.display = "none";
  updateTaskInteractivity(true);
  saveDateToHistory(key);
  updateHistoryDropdown();
});

historySelect.addEventListener("change", () => {
  const selectedDate = historySelect.value;
  updateDateDisplay(new Date(selectedDate));
  loadTasksForDate(selectedDate);
});

// FUNCTIONS

function updateDateDisplay(date) {
  const options = { weekday: "long", day: "numeric", month: "long" };
  const parts = date.toLocaleDateString("id-ID", options).split(" ");
  dayText.textContent = parts[0];
  dateText.textContent = parts[1];
  monthText.textContent = parts[2];
}

function getCurrentDateKey() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const key = getCurrentDateKey();
  const tasks = JSON.parse(localStorage.getItem(key)) || [];
  tasks.push({ text, completed: false });
  localStorage.setItem(key, JSON.stringify(tasks));
  taskInput.value = "";
  saveDateToHistory(key);
  loadTasksForDate(key);
  updateHistoryDropdown();
}

function createTaskElement(text, completed, index, isFinished = false) {
  const li = document.createElement("li");
  li.textContent = text;
  if (completed) li.classList.add("completed");

  li.addEventListener("click", () => {
    if (isFinished) return;
    li.classList.toggle("completed");
    saveTasks();
    updateProgress();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isFinished) return;
    const key = getCurrentDateKey();
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    tasks.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(tasks));
    loadTasksForDate(key);
  });

  li.appendChild(deleteBtn);
  return li;
}

function saveTasks() {
  const key = getCurrentDateKey();
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach((li) => {
    tasks.push({
      text: li.childNodes[0].textContent,
      completed: li.classList.contains("completed")
    });
  });
  localStorage.setItem(key, JSON.stringify(tasks));
}

function loadTasksForDate(dateStr) {
  const savedTasks = JSON.parse(localStorage.getItem(dateStr)) || [];
  const isFinished = localStorage.getItem(`${dateStr}-finished`) === "true";

  taskList.innerHTML = "";
  taskInput.disabled = isFinished;
  addBtn.disabled = isFinished;
  finishBtn.disabled = isFinished;
  finishBtn.style.display = isFinished ? "none" : "block";

  savedTasks.forEach((task, index) => {
    const li = createTaskElement(task.text, task.completed, index, isFinished);
    taskList.appendChild(li);
  });

  updateProgress();
}

function updateProgress() {
  const tasks = taskList.querySelectorAll("li");
  const completed = taskList.querySelectorAll(".completed");
  const percent = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);
  progressFill.style.width = percent + "%";
  progressFill.textContent = percent + "%";
}

function updateTaskInteractivity(isDisabled) {
  document.querySelectorAll("#taskList li").forEach((li) => {
    li.style.pointerEvents = isDisabled ? "none" : "auto";
  });
}

// === HISTORY ===
function saveDateToHistory(dateStr) {
  const history = JSON.parse(localStorage.getItem("taskDates")) || [];
  if (!history.includes(dateStr)) {
    history.push(dateStr);
    localStorage.setItem("taskDates", JSON.stringify(history));
  }
}

function updateHistoryDropdown() {
  const history = JSON.parse(localStorage.getItem("taskDates")) || [];
  history.sort((a, b) => new Date(b) - new Date(a)); // newest first

  historySelect.innerHTML = "";
  history.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = formatDateForDisplay(date);
    historySelect.appendChild(option);
  });

  const currentKey = getCurrentDateKey();
  if (history.includes(currentKey)) {
    historySelect.value = currentKey;
  }
}

function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
