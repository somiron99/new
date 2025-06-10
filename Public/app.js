// This file contains the JavaScript code for the To-Do List application.

document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const addButton = document.getElementById('add-button');
    const taskList = document.getElementById('task-list');
    const datePicker = document.getElementById('date-picker');
    const yesterdayList = document.getElementById('yesterday-list');

    // Set date picker to today by default
    const todayStr = new Date().toISOString().slice(0, 10);
    datePicker.value = todayStr;

    function getSelectedDateKey() {
        return datePicker.value;
    }

    function getYesterdayKey() {
        const yesterday = new Date(Date.now() - 86400000);
        return yesterday.toISOString().slice(0, 10);
    }

    function loadTasks() {
        taskList.innerHTML = "";
        const tasks = JSON.parse(localStorage.getItem(getSelectedDateKey())) || [];
        tasks.forEach(taskText => {
            createTaskElement(taskText);
        });
    }

    function loadYesterdayTasks() {
        if (!yesterdayList) return;
        yesterdayList.innerHTML = "";
        const tasks = JSON.parse(localStorage.getItem(getYesterdayKey())) || [];
        tasks.forEach((taskText, idx) => {
            const li = document.createElement('li');
            li.textContent = taskText;

            // Create individual remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = "Remove";
            removeBtn.style.marginLeft = "16px";
            removeBtn.onclick = function() {
                tasks.splice(idx, 1); // Remove this task
                localStorage.setItem(getYesterdayKey(), JSON.stringify(tasks));
                loadYesterdayTasks(); // Refresh the list
            };

            li.appendChild(removeBtn);
            yesterdayList.appendChild(li);
        });
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            tasks.push(li.firstChild.textContent);
        });
        localStorage.setItem(getSelectedDateKey(), JSON.stringify(tasks));
    }

    function createTaskElement(taskText) {
        const li = document.createElement('li');
        li.textContent = taskText;

        const delBtn = document.createElement('button');
        delBtn.textContent = "Issue Solved";
        delBtn.onclick = function() {
            li.remove();
            saveTasks();
        };

        li.appendChild(delBtn);
        taskList.appendChild(li);
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;
        createTaskElement(taskText);
        saveTasks();
        taskInput.value = "";
    }

    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // When the date changes, load that day's tasks
    datePicker.addEventListener('change', function() {
        loadTasks();
        loadYesterdayTasks();
    });

    const removeYesterdayBtn = document.getElementById('remove-yesterday-btn');
    if (removeYesterdayBtn) {
        removeYesterdayBtn.addEventListener('click', function() {
            localStorage.removeItem(getYesterdayKey());
            loadYesterdayTasks();
        });
    }

    loadTasks();
    loadYesterdayTasks();

    // Auth form logic
    const authSection = document.getElementById('auth-section');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const showLogin = document.getElementById('show-login');
    const showSignup = document.getElementById('show-signup');
    const dashboard = document.querySelector('.dashboard');

    // Switch forms
    showLogin.onclick = function(e) {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    };
    showSignup.onclick = function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    };

    // Signup
    signupBtn.onclick = function() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        if (!username || !password) return showPopup('Please fill all fields.');
        signup(username, password);
    };

    // Login
    loginBtn.onclick = function() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) return showPopup('Please fill all fields.');
        login(username, password);
    };

    // Show dashboard after login
    function showDashboard() {
        authSection.style.display = 'none';
        dashboard.style.display = 'flex';
        loadTasks();
        loadYesterdayTasks();
    }

    // Signup function
    function signup(username, password) {
        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                showPopup('Signup successful! Please login.', () => {
                    signupForm.style.display = 'none';
                    loginForm.style.display = 'block';
                });
            } else {
                showPopup(data.error || 'Signup failed.');
            }
        });
    }

    // Login function
    function login(username, password) {
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                showPopup('Login successful!', showDashboard);
            } else {
                showPopup(data.error || 'Login failed.');
            }
        });
    }

    // Popup function
    function showPopup(message, callback) {
        const popup = document.getElementById('popup-modal');
        const msg = document.getElementById('popup-message');
        const closeBtn = document.getElementById('close-popup');
        msg.textContent = message;
        popup.classList.add('active');
        closeBtn.onclick = function() {
            popup.classList.remove('active');
            if (callback) callback();
        };
    }

    // Auto-login if token exists (optional)
    if (localStorage.getItem('token')) {
        showDashboard();
    } else {
        authSection.style.display = 'block';
        dashboard.style.display = 'none';
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
});