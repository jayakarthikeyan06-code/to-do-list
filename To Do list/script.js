/* 
=========================================
   Aura - Premium To-Do List Application 
   Main JavaScript
========================================= 
*/

document.addEventListener('DOMContentLoaded', () => {
    // === STATE MANAGEMENT ===
    let tasks = JSON.parse(localStorage.getItem('aura_tasks')) || [];
    let categories = JSON.parse(localStorage.getItem('aura_categories')) || [
        { id: 'cat_personal', name: 'Personal', color: '#0088ff' },
        { id: 'cat_study', name: 'Study', color: '#8800ff' },
        { id: 'cat_work', name: 'Work', color: '#ff8800' },
        { id: 'cat_shopping', name: 'Shopping', color: '#ff0088' },
        { id: 'cat_health', name: 'Health', color: '#00ff88' },
        { id: 'cat_fitness', name: 'Fitness', color: '#00ffff' },
        { id: 'cat_coding', name: 'Coding', color: '#00FF9D' },
        { id: 'cat_college', name: 'College', color: '#ff00ff' }
    ];
    let streak = JSON.parse(localStorage.getItem('aura_streak')) || { count: 0, lastDate: null };
    let currentFilter = 'all';
    let searchQuery = '';

    // === DOM ELEMENTS ===
    // Loading & App
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    
    // Header
    const greetingText = document.getElementById('greeting-text');
    const currentDateEl = document.getElementById('current-date');
    const liveClockEl = document.getElementById('live-clock');
    const searchInput = document.getElementById('search-input');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    // Stats
    const statPending = document.getElementById('stat-pending');
    const statCompleted = document.getElementById('stat-completed');
    const statTotal = document.getElementById('stat-total');
    const progressCircleValue = document.getElementById('progress-circle-value');
    const progressText = document.getElementById('progress-text');
    
    // Task Input
    const addTaskForm = document.getElementById('add-task-form');
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskDate = document.getElementById('new-task-date');
    const newTaskPriority = document.getElementById('new-task-priority');
    const newTaskCategory = document.getElementById('new-task-category');
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    const notesContainer = document.getElementById('notes-container');
    const newTaskNotes = document.getElementById('new-task-notes');
    
    // Task List
    const tasksContainer = document.getElementById('tasks-container');
    const listTitle = document.getElementById('list-title');
    const emptyState = document.getElementById('empty-state');
    
    // Filters & Categories
    const filterMenu = document.getElementById('filter-menu');
    const categoryMenu = document.getElementById('category-menu');
    const addCategoryBtn = document.getElementById('add-category-btn');
    
    // Productivity
    const dailyQuoteEl = document.getElementById('daily-quote');
    const quoteAuthorEl = document.getElementById('quote-author');
    const streakCountEl = document.getElementById('streak-count');
    const badgesContainer = document.getElementById('badges-container');
    
    // Pomodoro
    const timerDisplay = document.getElementById('timer-display');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    
    // Modals
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    const categoryModal = document.getElementById('category-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    
    // === INITIALIZATION ===
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'grid';
            initApp();
        }, 500);
    }, 1500);

    function initApp() {
        updateTime();
        setInterval(updateTime, 1000);
        updateGreeting();
        renderCategories();
        populateCategorySelects();
        renderTasks();
        updateStats();
        checkStreak();
        setRandomQuote();
        renderBadges();
    }

    // === UTILITIES ===
    function saveTasks() {
        localStorage.setItem('aura_tasks', JSON.stringify(tasks));
        updateStats();
        checkAchievements();
    }

    function saveCategories() {
        localStorage.setItem('aura_categories', JSON.stringify(categories));
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // === TIME & GREETING ===
    function updateTime() {
        const now = new Date();
        liveClockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        greetingText.textContent = greeting;
    }

    // === CATEGORIES ===
    function renderCategories() {
        categoryMenu.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.dataset.filter = cat.id;
            li.innerHTML = `<span class="category-dot" style="color: ${cat.color}"></span> ${cat.name}`;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.menu ul li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                currentFilter = cat.id;
                listTitle.textContent = `${cat.name} Tasks`;
                renderTasks();
            });
            
            categoryMenu.appendChild(li);
        });
    }

    function populateCategorySelects() {
        const selects = [newTaskCategory, document.getElementById('edit-task-category')];
        selects.forEach(select => {
            if(!select) return;
            select.innerHTML = '<option value="">No Category</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        });
    }

    // === TASKS ===
    function renderTasks() {
        tasksContainer.innerHTML = '';
        
        let filteredTasks = tasks.filter(task => {
            // Search
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            // Filter
            const today = new Date().toISOString().split('T')[0];
            switch (currentFilter) {
                case 'all': return true;
                case 'today': return task.dueDate === today;
                case 'upcoming': return task.dueDate > today;
                case 'completed': return task.completed;
                case 'pending': return !task.completed;
                case 'overdue': return task.dueDate && task.dueDate < today && !task.completed;
                default: // Category filter
                    return task.category === currentFilter;
            }
        });

        // Sort: pending first, then by priority (high > med > low), then date
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            
            const pVals = { high: 3, medium: 2, low: 1 };
            if (pVals[a.priority] !== pVals[b.priority]) {
                return pVals[b.priority] - pVals[a.priority];
            }
            
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (filteredTasks.length === 0) {
            tasksContainer.appendChild(emptyState);
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                tasksContainer.appendChild(createTaskElement(task));
            });
        }
    }

    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.dataset.id = task.id;
        div.dataset.priority = task.priority;

        const cat = categories.find(c => c.id === task.category);
        const catBadge = cat ? `<span class="badge category-badge" style="color: ${cat.color}; border: 1px solid ${cat.color}33"><span class="category-dot" style="color: ${cat.color}"></span> ${cat.name}</span>` : '';
        
        let dueBadge = '';
        if (task.dueDate) {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = task.dueDate < today && !task.completed;
            const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dueBadge = `<span class="badge due-date ${isOverdue ? 'overdue' : ''}"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>`;
        }

        const notesHtml = task.notes ? `<div class="task-notes-preview">${task.notes.substring(0, 100)}${task.notes.length > 100 ? '...' : ''}</div>` : '';

        div.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="check-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="check-${task.id}" class="checkmark"></label>
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                <div class="task-meta">
                    ${dueBadge}
                    ${catBadge}
                </div>
                ${notesHtml}
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="openEditModal('${task.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete-btn" onclick="openDeleteModal('${task.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        // Checkbox listener
        const checkbox = div.querySelector(`input[type="checkbox"]`);
        checkbox.addEventListener('change', (e) => {
            toggleTaskStatus(task.id, e.target.checked);
        });

        return div;
    }

    // === TASK ACTIONS ===
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = newTaskInput.value.trim();
        if (!title) return;

        const newTask = {
            id: generateId(),
            title: title,
            completed: false,
            priority: newTaskPriority.value,
            category: newTaskCategory.value,
            dueDate: newTaskDate.value,
            notes: newTaskNotes.value.trim(),
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Reset form
        addTaskForm.reset();
        notesContainer.style.display = 'none';
        showToast('Task added successfully!', 'success');
    });

    window.toggleTaskStatus = function(id, isCompleted) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = isCompleted;
            saveTasks();
            renderTasks();
            if (isCompleted) {
                // Micro-interaction sound/effect could go here
            }
        }
    };

    // === EDIT TASK ===
    window.openEditModal = function(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-date').value = task.dueDate || '';
        document.getElementById('edit-task-priority').value = task.priority;
        document.getElementById('edit-task-category').value = task.category || '';
        document.getElementById('edit-task-notes').value = task.notes || '';

        editModal.classList.add('active');
    };

    document.getElementById('save-edit-btn').addEventListener('click', () => {
        const id = document.getElementById('edit-task-id').value;
        const taskIndex = tasks.findIndex(t => t.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: document.getElementById('edit-task-title').value.trim(),
                dueDate: document.getElementById('edit-task-date').value,
                priority: document.getElementById('edit-task-priority').value,
                category: document.getElementById('edit-task-category').value,
                notes: document.getElementById('edit-task-notes').value.trim()
            };
            
            saveTasks();
            renderTasks();
            editModal.classList.remove('active');
            showToast('Task updated successfully!', 'success');
        }
    });

    // === DELETE TASK ===
    window.openDeleteModal = function(id) {
        document.getElementById('delete-task-id').value = id;
        deleteModal.classList.add('active');
    };

    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        const id = document.getElementById('delete-task-id').value;
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        deleteModal.classList.remove('active');
        showToast('Task deleted', 'info');
    });

    // === FILTER & SEARCH ===
    filterMenu.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.menu ul li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            currentFilter = li.dataset.filter;
            listTitle.textContent = li.textContent.trim() + ' Tasks';
            renderTasks();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    // === CATEGORY MANAGEMENT ===
    addCategoryBtn.addEventListener('click', () => {
        categoryModal.classList.add('active');
    });

    document.getElementById('save-category-btn').addEventListener('click', () => {
        const name = document.getElementById('new-category-name').value.trim();
        const color = document.getElementById('new-category-color').value;
        
        if (name) {
            const newCat = {
                id: 'cat_' + generateId(),
                name: name,
                color: color
            };
            categories.push(newCat);
            saveCategories();
            renderCategories();
            populateCategorySelects();
            
            document.getElementById('new-category-name').value = '';
            categoryModal.classList.remove('active');
            showToast('Category added', 'success');
        }
    });

    // === STATS & PROGRESS ===
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        statTotal.textContent = total;
        statCompleted.textContent = completed;
        statPending.textContent = pending;

        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        progressText.textContent = `${percentage}%`;
        
        // Update circle (dashoffset from 125 to 0)
        const offset = 125 - (125 * percentage / 100);
        progressCircleValue.style.strokeDashoffset = offset;
    }

    // === STREAKS & ACHIEVEMENTS ===
    function checkStreak() {
        const today = new Date().toDateString();
        if (streak.lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (streak.lastDate === yesterday.toDateString()) {
                // Maintain streak if tasks were completed yesterday
                // In a real app, you'd check if goals were met yesterday
            } else if (streak.lastDate !== null) {
                // Break streak
                streak.count = 0;
            }
            streakCountEl.textContent = streak.count;
        } else {
            streakCountEl.textContent = streak.count;
        }
    }

    function checkAchievements() {
        const completedCount = tasks.filter(t => t.completed).length;
        
        // Example: Update daily streak if first task completed today
        const today = new Date().toDateString();
        if (completedCount > 0 && streak.lastDate !== today) {
            streak.count++;
            streak.lastDate = today;
            localStorage.setItem('aura_streak', JSON.stringify(streak));
            streakCountEl.textContent = streak.count;
            showToast('Daily streak updated! 🔥', 'success');
        }
        
        // Confetti when all tasks completed (and total > 0)
        if (tasks.length > 0 && completedCount === tasks.length) {
            triggerConfetti();
        }
        
        renderBadges(completedCount);
    }

    function renderBadges(completedCount = tasks.filter(t => t.completed).length) {
        const badges = [
            { id: 'first', name: 'First Step', desc: 'Complete 1 task', threshold: 1, icon: 'fa-medal' },
            { id: 'ten', name: 'Tenner', desc: 'Complete 10 tasks', threshold: 10, icon: 'fa-trophy' },
            { id: 'century', name: 'Master', desc: 'Complete 100 tasks', threshold: 100, icon: 'fa-crown' }
        ];
        
        badgesContainer.innerHTML = '';
        badges.forEach(b => {
            const unlocked = completedCount >= b.threshold;
            const div = document.createElement('div');
            div.className = `badge-item ${unlocked ? 'unlocked' : ''}`;
            div.dataset.badge = b.id;
            div.innerHTML = `
                <i class="fa-solid ${b.icon} badge-icon"></i>
                <span>${b.name}</span>
            `;
            badgesContainer.appendChild(div);
        });
    }

    // === POMODORO TIMER ===
    let timerInterval;
    let timeLeft = 25 * 60;
    let isRunning = false;
    const modes = {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    };

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = modes[btn.dataset.mode];
            updateTimerDisplay();
            timerStart.style.display = 'flex';
            timerPause.style.display = 'none';
        });
    });

    timerStart.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            timerStart.style.display = 'none';
            timerPause.style.display = 'flex';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    timerStart.style.display = 'flex';
                    timerPause.style.display = 'none';
                    showToast('Timer completed!', 'success');
                    // Play sound logic here
                }
            }, 1000);
        }
    });

    timerPause.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            timerStart.style.display = 'flex';
            timerPause.style.display = 'none';
        }
    });

    timerReset.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        const activeMode = document.querySelector('.mode-btn.active').dataset.mode;
        timeLeft = modes[activeMode];
        updateTimerDisplay();
        timerStart.style.display = 'flex';
        timerPause.style.display = 'none';
    });

    // === QUOTES ===
    function setRandomQuote() {
        const quotes = [
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
        ];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        dailyQuoteEl.textContent = `"${q.text}"`;
        quoteAuthorEl.textContent = `- ${q.author}`;
    }

    // === UI INTERACTIONS ===
    toggleNotesBtn.addEventListener('click', () => {
        if (notesContainer.style.display === 'none') {
            notesContainer.style.display = 'block';
            toggleNotesBtn.textContent = 'Hide Notes';
        } else {
            notesContainer.style.display = 'none';
            toggleNotesBtn.textContent = 'Add Notes';
            newTaskNotes.value = '';
        }
    });

    // Modals close logic
    closeModals.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            sidebar.classList.remove('active');
        }
    });

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === CONFETTI ANIMATION ===
    function triggerConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#00FF9D', '#0088ff', '#ff00ff', '#ffffff'];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                r: Math.random() * 6 + 2,
                dx: Math.random() * 10 - 5,
                dy: Math.random() * -10 - 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 10,
                tiltAngle: 0,
                tiltAngleInc: (Math.random() * 0.07) + 0.05
            });
        }

        let animationId;
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;
            
            particles.forEach(p => {
                p.tiltAngle += p.tiltAngleInc;
                p.y += (Math.cos(p.tiltAngle) + p.dy + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle) * 2;
                p.dy += 0.1; // gravity
                
                if (p.y <= canvas.height) activeParticles++;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();
            });

            if (activeParticles > 0) {
                animationId = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        draw();
        
        // Stop after 3 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 3000);
    }
});