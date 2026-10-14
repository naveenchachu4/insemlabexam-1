
const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "User Interface Mockups",
    description: "Design dark and light themes for the main user dashboard layout.",
    priority: "High",
    status: "in-progress",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "task-2",
    title: "API Authentication",
    description: "Implement JWT tokens and secure API login endpoints.",
    priority: "Medium",
    status: "todo",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "task-3",
    title: "Analytics Dashboard",
    description: "Connect statistics widgets with monthly user active counts.",
    priority: "Low",
    status: "completed",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
  }
];

// STATE MANAGEMENT
let tasks = JSON.parse(localStorage.getItem('task_system_tasks')) || DEFAULT_TASKS;
let currentUser = JSON.parse(localStorage.getItem('task_system_active_user')) || null;
let currentFilter = 'all';

// APPLICATION INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    showDashboard();
  } else {
    showAuthScreen();
  }

  // Setup Form Listeners
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
});

// AUTHENTICATION LOGIC
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginTab.classList.add('active');
    regTab.classList.remove('active');
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const username = email.split('@')[0];
  
  currentUser = { name: username, email: email };
  localStorage.setItem('task_system_active_user', JSON.stringify(currentUser));
  showDashboard();
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;

  currentUser = { name: name, email: email };
  localStorage.setItem('task_system_active_user', JSON.stringify(currentUser));
  showDashboard();
}

function handleLogout() {
  localStorage.removeItem('task_system_active_user');
  currentUser = null;
  showAuthScreen();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('portal-app').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('portal-app').classList.remove('hidden');

  // Set Profile Name & Avatar
  document.getElementById('user-display-name').textContent = currentUser.name;
  document.getElementById('header-avatar-circle').textContent = currentUser.name.charAt(0).toUpperCase();

  renderTasks();
}

// TASK MANAGEMENT RENDER & FILTER
function setFilter(filter, element) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  renderTasks();
}

function handleSearch() {
  renderTasks();
}

function renderTasks() {
  const tasksGrid = document.getElementById('tasks-grid');
  const emptyState = document.getElementById('empty-state');
  const searchQuery = document.getElementById('task-search-input').value.toLowerCase();

  // Update Counters
  document.getElementById('count-all').textContent = tasks.length;
  document.getElementById('count-todo').textContent = tasks.filter(t => t.status === 'todo').length;
  document.getElementById('count-in-progress').textContent = tasks.filter(t => t.status === 'in-progress').length;
  document.getElementById('count-completed').textContent = tasks.filter(t => t.status === 'completed').length;

  // Filter Tasks
  let filtered = tasks.filter(task => {
    const matchesFilter = (currentFilter === 'all') || (task.status === currentFilter);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery) || task.description.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  tasksGrid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = `
        <div class="task-img-container">
          <img src="${task.image}" alt="Task Banner">
        </div>
        <div class="task-body">
          <div class="task-meta">
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            <span class="status-tag status-${task.status}" onclick="cycleStatus('${task.id}')">
              ${formatStatus(task.status)}
            </span>
          </div>
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <p class="task-desc">${escapeHtml(task.description)}</p>
          <div class="task-footer">
            <button class="icon-btn" onclick="openEditModal('${task.id}')" title="Edit Task">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="icon-btn delete" onclick="deleteTask('${task.id}')" title="Delete Task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
      tasksGrid.appendChild(card);
    });
  }

  // Save state
  localStorage.setItem('task_system_tasks', JSON.stringify(tasks));
}

function formatStatus(status) {
  if (status === 'todo') return 'To Do';
  if (status === 'in-progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return status;
}

function cycleStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  if (task.status === 'todo') task.status = 'in-progress';
  else if (task.status === 'in-progress') task.status = 'completed';
  else task.status = 'todo';

  renderTasks();
}

// MODAL & CRUD LOGIC
function openCreateModal() {
  document.getElementById('modal-title').textContent = 'Create New Task';
  document.getElementById('task-id').value = '';
  document.getElementById('task-form').reset();
  document.getElementById('task-modal').classList.remove('hidden');
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('modal-title').textContent = 'Edit Task';
  document.getElementById('task-id').value = task.id;
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-status').value = task.status;

  // Set image input checked state
  const imgRadios = document.querySelectorAll('input[name="task-img"]');
  imgRadios.forEach(r => {
    if (r.value === task.image) r.checked = true;
  });

  document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
}

function saveTask(e) {
  e.preventDefault();
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const priority = document.getElementById('task-priority').value;
  const status = document.getElementById('task-status').value;
  const image = document.querySelector('input[name="task-img"]:checked').value;

  if (id) {
    // Update
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.title = title;
      task.description = description;
      task.priority = priority;
      task.status = status;
      task.image = image;
    }
  } else {
    // Create
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      description,
      priority,
      status,
      image
    };
    tasks.unshift(newTask);
  }

  closeModal();
  renderTasks();
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}