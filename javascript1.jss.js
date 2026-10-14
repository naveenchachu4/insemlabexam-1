/* =====================================================
   TASKFLOW TASK MANAGEMENT SYSTEM
   ===================================================== */


/* -----------------------------
   DATA
----------------------------- */

let tasks =
    JSON.parse(localStorage.getItem("tasks")) || [
        {
            id: 1,
            title: "Complete Java Assignment",
            description: "Finish inheritance and interface programs",
            priority: "High",
            status: "In Progress",
            deadline: getDateAfter(1),
            category: "College"
        },

        {
            id: 2,
            title: "Build Task Management Website",
            description: "Create professional task dashboard",
            priority: "Urgent",
            status: "To Do",
            deadline: getDateAfter(3),
            category: "Development"
        },

        {
            id: 3,
            title: "Submit Project Report",
            description: "Prepare and submit final report",
            priority: "Medium",
            status: "Review",
            deadline: getDateAfter(5),
            category: "Project"
        },

        {
            id: 4,
            title: "Learn React",
            description: "Practice React components and hooks",
            priority: "Low",
            status: "Completed",
            deadline: getDateAfter(-1),
            category: "Learning"
        }
    ];


let projects =
    JSON.parse(localStorage.getItem("projects")) || [
        {
            id: 1,
            name: "Task Management System",
            description: "Build a modern productivity application",
            progress: 65
        },

        {
            id: 2,
            name: "College Project",
            description: "Complete semester project",
            progress: 40
        },

        {
            id: 3,
            name: "Learning",
            description: "Improve development skills",
            progress: 80
        }
    ];


let team =
    JSON.parse(localStorage.getItem("team")) || [
        {
            name: "Manohar",
            role: "Administrator"
        },

        {
            name: "Alex",
            role: "Developer"
        },

        {
            name: "Sarah",
            role: "Designer"
        },

        {
            name: "Rahul",
            role: "Project Manager"
        }
    ];


let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];


let draggedTaskId = null;

let currentCalendarDate = new Date();


/* -----------------------------
   INITIALIZATION
----------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        lucide.createIcons();

        loadTheme();

        saveData();

        updateDashboard();

        renderTasks();

        renderProjects();

        renderKanban();

        renderCalendar();

        renderTeam();

        renderNotifications();

        updateAnalytics();

    }
);


/* -----------------------------
   PAGE NAVIGATION
----------------------------- */

function showPage(pageId, button) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active-page");
        });


    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active-page");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    }


    if (pageId === "dashboard") {
        updateDashboard();
    }

    if (pageId === "tasks") {
        renderTasks();
    }

    if (pageId === "kanban") {
        renderKanban();
    }

    if (pageId === "calendar") {
        renderCalendar();
    }

    if (pageId === "analytics") {
        updateAnalytics();
    }

    if (pageId === "team") {
        renderTeam();
    }

    if (pageId === "notifications") {
        renderNotifications();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -----------------------------
   TASK MODAL
----------------------------- */

function openTaskModal() {

    document
        .getElementById("taskModal")
        .classList.add("show");
}


function closeTaskModal() {

    document
        .getElementById("taskModal")
        .classList.remove("show");

    document
        .getElementById("taskForm")
        .reset();
}


/* -----------------------------
   CREATE TASK
----------------------------- */

document
    .getElementById("taskForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const task = {

                id: Date.now(),

                title:
                    document
                        .getElementById("taskTitle")
                        .value,

                description:
                    document
                        .getElementById("taskDescription")
                        .value,

                priority:
                    document
                        .getElementById("taskPriority")
                        .value,

                status:
                    document
                        .getElementById("taskStatus")
                        .value,

                deadline:
                    document
                        .getElementById("taskDeadline")
                        .value,

                category:
                    document
                        .getElementById("taskCategory")
                        .value

            };


            tasks.unshift(task);


            notifications.unshift({

                id: Date.now(),

                message:
                    `New task "${task.title}" created.`,

                time: "Just now"

            });


            saveData();

            closeTaskModal();

            updateDashboard();

            renderTasks();

            renderKanban();

            renderCalendar();

            renderNotifications();

            updateAnalytics();

        }
    );


/* -----------------------------
   RENDER TASKS
----------------------------- */

function renderTasks() {

    const container =
        document.getElementById("taskList");

    if (!container) return;


    const search =
        document
            .getElementById("taskSearch")
            ?.value
            .toLowerCase() || "";


    const status =
        document
            .getElementById("statusFilter")
            ?.value || "all";


    const priority =
        document
            .getElementById("priorityFilter")
            ?.value || "all";


    const filtered =
        tasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                task.status === status;


            const matchesPriority =
                priority === "all" ||
                task.priority === priority;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );

        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h3>No tasks found</h3>
                <p>Create a new task to get started.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(task => `

            <div class="task-row">

                <div class="task-info">

                    <input
                        class="task-check"
                        type="checkbox"
                        ${task.status === "Completed" ? "checked" : ""}
                        onchange="toggleComplete(${task.id})"
                    >

                    <div>

                        <strong>
                            ${escapeHTML(task.title)}
                        </strong>

                        <p class="task-description">
                            ${escapeHTML(task.description || "")}
                        </p>

                        <small>
                            Deadline:
                            ${formatDate(task.deadline)}
                        </small>

                    </div>

                </div>


                <div class="task-meta">

                    <span
                        class="badge priority-${task.priority}">
                        ${task.priority}
                    </span>

                    <span class="badge status-badge">
                        ${task.status}
                    </span>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">

                        <i data-lucide="trash-2"></i>

                    </button>

                </div>

            </div>

        `).join("");


    lucide.createIcons();
}


/* -----------------------------
   COMPLETE TASK
----------------------------- */

function toggleComplete(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    if (task.status === "Completed") {

        task.status = "To Do";

    } else {

        task.status = "Completed";

        notifications.unshift({

            id: Date.now(),

            message:
                `Task "${task.title}" completed.`,

            time: "Just now"

        });

    }


    saveData();

    updateDashboard();

    renderTasks();

    renderKanban();

    renderNotifications();

    updateAnalytics();

}


/* -----------------------------
   DELETE TASK
----------------------------- */

function deleteTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    if (
        !confirm(
            `Delete "${task.title}"?`
        )
    ) return;


    tasks =
        tasks.filter(t => t.id !== id);


    saveData();

    updateDashboard();

    renderTasks();

    renderKanban();

    renderCalendar();

    updateAnalytics();

}


/* -----------------------------
   DASHBOARD
----------------------------- */

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;


    const pending =
        tasks.filter(
            t => t.status !== "Completed"
        ).length;


    const overdue =
        tasks.filter(
            t =>
                t.deadline &&
                new Date(t.deadline) < new Date() &&
                t.status !== "Completed"
        ).length;


    document
        .getElementById("totalTasks")
        .textContent = total;


    document
        .getElementById("completedTasks")
        .textContent = completed;


    document
        .getElementById("pendingTasks")
        .textContent = pending;


    document
        .getElementById("overdueTasks")
        .textContent = overdue;


    const recent =
        document.getElementById("recentTasks");


    recent.innerHTML =
        tasks.slice(0, 5)
            .map(task => `

                <div class="task-row">

                    <div>

                        <strong>
                            ${escapeHTML(task.title)}
                        </strong>

                        <p class="task-description">
                            ${escapeHTML(task.description || "")}
                        </p>

                    </div>

                    <span class="badge status-badge">
                        ${task.status}
                    </span>

                </div>

            `)
            .join("");


    updateCharts();
}


/* -----------------------------
   KANBAN
----------------------------- */

function renderKanban() {

    const columns = {

        "To Do":
            document.getElementById("todoColumn"),

        "In Progress":
            document.getElementById("progressColumn"),

        "Review":
            document.getElementById("reviewColumn"),

        "Completed":
            document.getElementById("completedColumn")

    };


    Object.values(columns)
        .forEach(column => {
            if (column)
                column.innerHTML = "";
        });


    const counts = {
        "To Do": 0,
        "In Progress": 0,
        "Review": 0,
        "Completed": 0
    };


    tasks.forEach(task => {

        counts[task.status]++;


        const card =
            document.createElement("div");

        card.className =
            "kanban-task";

        card.draggable = true;

        card.dataset.id = task.id;


        card.innerHTML = `

            <h4>
                ${escapeHTML(task.title)}
            </h4>

            <span class="badge priority-${task.priority}">
                ${task.priority}
            </span>

            <p class="task-description">
                ${escapeHTML(task.description || "")}
            </p>

        `;


        card.addEventListener(
            "dragstart",
            () => {

                draggedTaskId =
                    task.id;

            }
        );


        columns[task.status]
            .appendChild(card);

    });


    document
        .getElementById("todoCount")
        .textContent = counts["To Do"];


    document
        .getElementById("progressCount")
        .textContent = counts["In Progress"];


    document
        .getElementById("reviewCount")
        .textContent = counts["Review"];


    document
        .getElementById("completedCount")
        .textContent = counts["Completed"];

}


function allowDrop(event) {

    event.preventDefault();

}


function dropTask(event) {

    event.preventDefault();


    const status =
        event
            .currentTarget
            .dataset
            .status;


    const task =
        tasks.find(
            t => t.id === draggedTaskId
        );


    if (!task) return;


    task.status = status;


    if (status === "Completed") {

        notifications.unshift({

            id: Date.now(),

            message:
                `Task "${task.title}" completed.`,

            time: "Just now"

        });

    }


    saveData();

    renderKanban();

    renderTasks();

    updateDashboard();

    renderNotifications();

    updateAnalytics();

}


/* -----------------------------
   PROJECTS
----------------------------- */

function renderProjects() {

    const grid =
        document.getElementById("projectGrid");


    grid.innerHTML =
        projects.map(project => `

            <div class="project-card">

                <div class="project-color">
                    <i data-lucide="folder"></i>
                </div>

                <h2>
                    ${escapeHTML(project.name)}
                </h2>

                <p>
                    ${escapeHTML(project.description)}
                </p>

                <strong>
                    ${project.progress}% Complete
                </strong>

                <div class="project-progress">

                    <div
                        style="width:${project.progress}%">
                    </div>

                </div>

            </div>

        `).join("");


    lucide.createIcons();
}


function createProject() {

    const name =
        prompt("Enter project name:");

    if (!name) return;


    const description =
        prompt("Enter project description:");


    projects.push({

        id: Date.now(),

        name,

        description:
            description || "",

        progress: 0

    });


    saveData();

    renderProjects();

}


/* -----------------------------
   CALENDAR
----------------------------- */

function renderCalendar() {

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    document
        .getElementById("calendarMonth")
        .textContent =
        `${monthNames[month]} ${year}`;


    const firstDay =
        new Date(year, month, 1)
            .getDay();


    const days =
        new Date(year, month + 1, 0)
            .getDate();


    const grid =
        document.getElementById(
            "calendarGrid"
        );


    grid.innerHTML = "";


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        grid.innerHTML +=
            `<div></div>`;

    }


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            date.toISOString()
                .split("T")[0];


        const dayTasks =
            tasks.filter(
                task =>
                    task.deadline === dateString
            );


        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        cell.innerHTML = `

            <div class="day-number">
                ${day}
            </div>

            ${dayTasks.map(task => `

                <div class="calendar-task">
                    ${escapeHTML(task.title)}
                </div>

            `).join("")}

        `;


        grid.appendChild(cell);

    }

}


function previousMonth() {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() - 1
    );

    renderCalendar();

}


function nextMonth() {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() + 1
    );

    renderCalendar();

}


/* -----------------------------
   TEAM
----------------------------- */

function renderTeam() {

    const grid =
        document.getElementById("teamGrid");


    grid.innerHTML =
        team.map(member => `

            <div class="team-card">

                <div class="team-avatar">
                    ${member.name.charAt(0)}
                </div>

                <h2>
                    ${escapeHTML(member.name)}
                </h2>

                <p>
                    ${escapeHTML(member.role)}
                </p>

            </div>

        `).join("");

}


function addMember() {

    const name =
        prompt("Enter member name:");

    if (!name) return;


    const role =
        prompt("Enter member role:");


    team.push({

        name,

        role:
            role || "Team Member"

    });


    saveData();

    renderTeam();

}


/* -----------------------------
   NOTIFICATIONS
----------------------------- */

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationList"
        );


    document
        .getElementById(
            "notificationCount"
        )
        .textContent =
        notifications.length;


    if (notifications.length === 0) {

        container.innerHTML = `

            <div class="notification">

                <div class="notification-icon">
                    <i data-lucide="bell-off"></i>
                </div>

                <div>
                    <strong>
                        No notifications
                    </strong>

                    <small>
                        You're all caught up.
                    </small>
                </div>

            </div>

        `;

        lucide.createIcons();

        return;
    }


    container.innerHTML =
        notifications
            .slice(0, 20)
            .map(notification => `

                <div class="notification">

                    <div class="notification-icon">
                        <i data-lucide="bell"></i>
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                                notification.message
                            )}
                        </strong>

                        <small>
                            ${notification.time}
                        </small>

                    </div>

                </div>

            `)
            .join("");


    lucide.createIcons();

}


/* -----------------------------
   ANALYTICS
----------------------------- */

function updateAnalytics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;


    const rate =
        total === 0
            ? 0
            : Math.round(
                completed / total * 100
            );


    document
        .getElementById(
            "completionRate"
        )
        .textContent =
        `${rate}%`;


    document
        .getElementById(
            "productivityScore"
        )
        .textContent =
        completed * 10;


    updateCharts();

}


/* -----------------------------
   CHARTS
----------------------------- */

let productivityChart;
let statusChart;
let priorityChart;
let analyticsStatusChart;


function updateCharts() {

    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;


    const pending =
        tasks.filter(
            t => t.status !== "Completed"
        ).length;


    const urgent =
        tasks.filter(
            t => t.priority === "Urgent"
        ).length;


    const high =
        tasks.filter(
            t => t.priority === "High"
        ).length;


    const medium =
        tasks.filter(
            t => t.priority === "Medium"
        ).length;


    const low =
        tasks.filter(
            t => t.priority === "Low"
        ).length;


    if (statusChart)
        statusChart.destroy();


    const statusCanvas =
        document.getElementById(
            "statusChart"
        );


    if (statusCanvas) {

        statusChart =
            new Chart(
                statusCanvas,
                {

                    type: "doughnut",

                    data: {

                        labels: [
                            "Completed",
                            "Pending"
                        ],

                        datasets: [{
                            data: [
                                completed,
                                pending
                            ]
                        }]

                    },

                    options: {
                        responsive: true
                    }

                }
            );

    }


    if (productivityChart)
        productivityChart.destroy();


    const productivityCanvas =
        document.getElementById(
            "productivityChart"
        );


    if (productivityCanvas) {

        productivityChart =
            new Chart(
                productivityCanvas,
                {

                    type: "line",

                    data: {

                        labels: [
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun"
                        ],

                        datasets: [{
                            label:
                                "Completed Tasks",

                            data: [
                                2,
                                3,
                                1,
                                completed,
                                4,
                                2,
                                completed + 1
                            ],

                            tension: 0.4,

                            fill: true

                        }]

                    },

                    options: {
                        responsive: true
                    }

                }
            );

    }


    if (priorityChart)
        priorityChart.destroy();


    const priorityCanvas =
        document.getElementById(
            "priorityChart"
        );


    if (priorityCanvas) {

        priorityChart =
            new Chart(
                priorityCanvas,
                {

                    type: "bar",

                    data: {

                        labels: [
                            "Urgent",
                            "High",
                            "Medium",
                            "Low"
                        ],

                        datasets: [{

                            label:
                                "Tasks",

                            data: [
                                urgent,
                                high,
                                medium,
                                low
                            ]

                        }]

                    },

                    options: {
                        responsive: true
                    }

                }
            );

    }


    if (analyticsStatusChart)
        analyticsStatusChart.destroy();


    const analyticsCanvas =
        document.getElementById(
            "analyticsStatusChart"
        );


    if (analyticsCanvas) {

        analyticsStatusChart =
            new Chart(
                analyticsCanvas,
                {

                    type: "doughnut",

                    data: {

                        labels: [
                            "To Do",
                            "In Progress",
                            "Review",
                            "Completed"
                        ],

                        datasets: [{

                            data: [
                                countStatus("To Do"),
                                countStatus("In Progress"),
                                countStatus("Review"),
                                countStatus("Completed")
                            ]

                        }]

                    },

                    options: {
                        responsive: true
                    }

                }
            );

    }

}


function countStatus(status) {

    return tasks.filter(
        task =>
            task.status === status
    ).length;

}


/* -----------------------------
   GLOBAL SEARCH
----------------------------- */

function globalSearch() {

    const search =
        document
            .getElementById("globalSearch")
            .value
            .toLowerCase();


    if (!search) return;


    const result =
        tasks.find(
            task =>
                task.title
                    .toLowerCase()
                    .includes(search)
        );


    if (result) {

        showPage("tasks");

        document
            .getElementById("taskSearch")
            .value = search;

        renderTasks();

    }

}


/* -----------------------------
   DARK MODE
----------------------------- */

function toggleTheme() {

    document
        .body
        .classList
        .toggle("dark");


    const dark =
        document
            .body
            .classList
            .contains("dark");


    localStorage.setItem(
        "darkMode",
        dark
    );


    const toggle =
        document.getElementById(
            "darkToggle"
        );


    if (toggle) {
        toggle.checked = dark;
    }

}


function loadTheme() {

    const dark =
        localStorage.getItem(
            "darkMode"
        ) === "true";


    if (dark) {

        document
            .body
            .classList
            .add("dark");

    }


    const toggle =
        document.getElementById(
            "darkToggle"
        );


    if (toggle) {
        toggle.checked = dark;
    }

}


/* -----------------------------
   STORAGE
----------------------------- */

function saveData() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );


    localStorage.setItem(
        "projects",
        JSON.stringify(projects)
    );


    localStorage.setItem(
        "team",
        JSON.stringify(team)
    );


    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );

}


/* -----------------------------
   HELPERS
----------------------------- */

function getDateAfter(days) {

    const date = new Date();

    date.setDate(
        date.getDate() + days
    );

    return date
        .toISOString()
        .split("T")[0];

}


function formatDate(date) {

    if (!date) return "No deadline";

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}