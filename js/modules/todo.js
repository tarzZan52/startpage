// Task management module
const TodoModule = {
    tasks: [],
    currentFilter: 'all',
    
    // DOM elements
    elements: {
        input: null,
        addBtn: null,
        list: null,
        stats: null,
        prioritySelect: null,
        filters: null,
        clearCompleted: null,
        deadlineInput: null
    },
    
    // Module initialization
    init() {
        if (!this.loadElements()) {
            console.error('Todo module initialization failed: missing elements');
            return;
        }
        this.loadTasks();
        this.setupEventListeners();
        this.setupEventBusListeners();
        this.render();
    },
    
    // Loading DOM elements
    loadElements() {
        this.elements.input = document.getElementById('todoInput');
        this.elements.addBtn = document.getElementById('todoAddBtn');
        this.elements.list = document.getElementById('todoList');
        this.elements.stats = document.getElementById('todoStats');
        this.elements.prioritySelect = document.getElementById('todoPriority');
        this.elements.filters = document.querySelectorAll('.todo-filter');
        this.elements.clearCompleted = document.getElementById('todoClearCompleted');
        // deadlineInput is not used in current version
        this.elements.deadlineInput = null;
        
        // Check that key elements are found
        const requiredElements = ['input', 'addBtn', 'list', 'stats', 'prioritySelect'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            console.error('Missing Todo elements:', missingElements);
            return false;
        }
        
        return true;
    },
    
    // Setup event handlers
    setupEventListeners() {
        // Task addition
        this.elements.addBtn.addEventListener('click', () => this.addTask());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Filters
        this.elements.filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed
        this.elements.clearCompleted.addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // Global hotkeys
        document.addEventListener('keydown', (e) => {
            if (!Dashboard.isActive || 
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }
            
            // Ctrl/Cmd + Enter - add task
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.elements.input.focus();
            }
        });
    },
    
    // Setup EventBus listeners
    setupEventBusListeners() {
        // Listen to events from Pomodoro module
        EventBus.on('pomodoro:task-time-updated', (data) => {
            this.updateTaskTime(data.taskId, data.minutes);
        });
    },
    
    // Adding new task
    addTask() {
        const text = this.elements.input.value.trim();
        if (!text) return;
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: this.elements.prioritySelect.value,
            deadline: this.elements.deadlineInput ? this.elements.deadlineInput.value : null,
            createdAt: new Date().toISOString(),
            completedAt: null,
            // New fields for time tracking
            timeSpent: 0, // in minutes
            pomodoroSessions: 0,
            lastWorkedAt: null
        };
        
        this.tasks.unshift(task); // Add to beginning
        this.saveTasks();
        this.render();
        
        // Send task update event
        EventBus.emit('tasks:updated');
        
        // Clear form
        this.elements.input.value = '';
        this.elements.prioritySelect.value = 'medium';
        if (this.elements.deadlineInput) {
            this.elements.deadlineInput.value = '';
        }
        
        // Add animation
        this.animateTaskAdd();
    },
    
    // Toggle task state
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            
            // Send task update events
            EventBus.emit('tasks:updated');
        }
    },
    
    // Task deletion
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        
        // Send task update event
        EventBus.emit('tasks:updated');
    },
    
    // Task editing
    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
            
            // Send task update event
            EventBus.emit('tasks:updated');
        }
    },
    
    // Change task priority
    changePriority(id, newPriority) {
        const task = this.tasks.find(t => t.id !== id);
        if (task) {
            task.priority = newPriority;
            this.saveTasks();
            this.render();
        }
    },
    
    // Update task work time
    updateTaskTime(taskId, minutes) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.timeSpent += minutes;
            task.pomodoroSessions += 1;
            task.lastWorkedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            
            // Send task update event
            EventBus.emit('tasks:updated');
        }
    },
    
    // Get active tasks for Pomodoro selection
    getActiveTasks() {
        return this.tasks.filter(t => !t.completed);
    },
    
    // Get task by ID
    getTaskById(id) {
        return this.tasks.find(t => t.id === id);
    },
    
    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter
        this.elements.filters.forEach(f => {
            f.classList.toggle('active', f.dataset.filter === filter);
        });
        
        this.render();
    },
    
    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        Modal.confirm(`Delete ${completedCount} completed tasks?`, () => {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            
            // Send task update event
            EventBus.emit('tasks:updated');
        });
    },
    
    // Get filtered tasks
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
        }
        
        // Sorting: first by completion, then by last work, then by priority
        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Sort by last work (recently used first)
            if (!a.completed && a.lastWorkedAt && b.lastWorkedAt) {
                return new Date(b.lastWorkedAt) - new Date(a.lastWorkedAt);
            } else if (!a.completed && a.lastWorkedAt && !b.lastWorkedAt) {
                return -1;
            } else if (!a.completed && !a.lastWorkedAt && b.lastWorkedAt) {
                return 1;
            }
            
            // Sort by deadline (nearest first)
            if (!a.completed && a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            } else if (!a.completed && a.deadline && !b.deadline) {
                return -1;
            } else if (!a.completed && !a.deadline && b.deadline) {
                return 1;
            }
            
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    },
    
    // Time formatting
    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    },
    
    // Create task HTML element
    createTaskElement(task) {
        const item = document.createElement('div');
        item.className = `todo-item priority-${task.priority}`;
        if (task.completed) {
            item.classList.add('completed');
        }
        
        const priorityDots = {
            low: '●',
            medium: '●●', 
            high: '●●●'
        };
        
        // Determine deadline status
        let deadlineHtml = '';
        if (task.deadline && !task.completed) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadline = new Date(task.deadline);
            deadline.setHours(0, 0, 0, 0);
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            
            let deadlineClass = 'todo-deadline';
            let deadlineText = '';
            
            if (daysLeft < 0) {
                deadlineClass += ' overdue';
                deadlineText = `Overdue by ${Math.abs(daysLeft)} days`;
            } else if (daysLeft === 0) {
                deadlineClass += ' soon';
                deadlineText = 'Today';
            } else if (daysLeft === 1) {
                deadlineClass += ' soon';
                deadlineText = 'Tomorrow';
            } else if (daysLeft <= 3) {
                deadlineClass += ' soon';
                deadlineText = `In ${daysLeft} days`;
            } else {
                deadlineText = deadline.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }
            
            deadlineHtml = `<span class="${deadlineClass}">📅 ${deadlineText}</span>`;
        }
        
        // Task work time
        let timeHtml = '';
        if (task.timeSpent > 0) {
            timeHtml = `<span class="todo-time" title="${task.pomodoroSessions} Pomodoro sessions">
                🍅 ${this.formatTime(task.timeSpent)}
            </span>`;
        }
        
        item.innerHTML = `
            <div class="todo-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            </div>
            <div class="todo-content">
                <div class="todo-text" data-id="${task.id}">${this.escapeHtml(task.text)}</div>
                <div class="todo-meta">
                    ${timeHtml}
                    ${deadlineHtml}
                </div>
            </div>
            <div class="todo-priority" title="Priority: ${task.priority}">${priorityDots[task.priority]}</div>
            <button class="todo-delete" data-id="${task.id}" title="Delete task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19 6l-2 14H7L5 6"></path>
                </svg>
            </button>
        `;
        
        // Event handlers
        const checkbox = item.querySelector('.todo-checkbox');
        const text = item.querySelector('.todo-text');
        const deleteBtn = item.querySelector('.todo-delete');
        
        checkbox.addEventListener('click', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });
        
        // Edit on double click
        text.addEventListener('dblclick', () => this.startEdit(task.id, text));
        
        return item;
    },
    
    // Start task editing
    startEdit(taskId, textElement) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit-input';
        input.value = task.text;
        input.maxLength = 100;
        
        textElement.replaceWith(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                this.editTask(taskId, newText);
            } else {
                this.render();
            }
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                this.render();
            }
        });
    },
    
    // Task add animation
    animateTaskAdd() {
        const firstTask = this.elements.list.querySelector('.todo-item');
        if (firstTask) {
            firstTask.style.transform = 'translateY(-20px)';
            firstTask.style.opacity = '0';
            
            requestAnimationFrame(() => {
                firstTask.style.transition = 'all 0.3s ease';
                firstTask.style.transform = 'translateY(0)';
                firstTask.style.opacity = '1';
            });
        }
    },
    
    // Render task list
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear list
        this.elements.list.innerHTML = '';
        
        // Add tasks
        if (filteredTasks.length === 0) {
            this.elements.list.innerHTML = this.getEmptyMessage();
        } else {
            filteredTasks.forEach(task => {
                this.elements.list.appendChild(this.createTaskElement(task));
            });
        }
        
        // Update statistics
        this.updateStats();
        
        // Update clear button
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.elements.clearCompleted.style.display = completedCount > 0 ? 'block' : 'none';
    },
    
    // Empty list message
    getEmptyMessage() {
        const messages = {
            all: 'No tasks. Add your first one!',
            active: 'All tasks completed! 🎉',
            completed: 'No completed tasks'
        };
        
        return `
            <div class="todo-empty">
                <div class="todo-empty-icon">📝</div>
                <div class="todo-empty-text">${messages[this.currentFilter]}</div>
            </div>
        `;
    },
    
    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        this.elements.stats.textContent = `${completed}/${total}`;
        
        // Show completion percentage
        if (total > 0) {
            const percent = Math.round((completed / total) * 100);
            const totalTime = this.tasks.reduce((sum, t) => sum + t.timeSpent, 0);
            this.elements.stats.title = `Completed ${percent}% (${active} active, ${this.formatTime(totalTime)} total)`;
        }
    },
    
    // Get statistics for analytics
    getStatisticsData() {
        const now = new Date();
        const stats = {
            daily: {},
            weekly: {},
            tasksByDay: {},
            pomodoroTasks: 0,
            regularTasks: 0
        };
        
        // Analyze completed tasks
        this.tasks.filter(t => t.completed && t.completedAt).forEach(task => {
            const completedDate = new Date(task.completedAt);
            const dateKey = completedDate.toISOString().split('T')[0];
            
            // Подсчет по дням
            if (!stats.daily[dateKey]) {
                stats.daily[dateKey] = { total: 0, withPomodoro: 0, withoutPomodoro: 0 };
            }
            
            stats.daily[dateKey].total++;
            
            if (task.pomodoroSessions > 0) {
                stats.daily[dateKey].withPomodoro++;
                stats.pomodoroTasks++;
            } else {
                stats.daily[dateKey].withoutPomodoro++;
                stats.regularTasks++;
            }
        });
        
        return stats;
    },
    
    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Сохранение в localStorage
    saveTasks() {
        localStorage.setItem('todo_tasks', JSON.stringify(this.tasks));
    },
    
    // Загрузка из localStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('todo_tasks');
            if (saved) {
                this.tasks = JSON.parse(saved);
                // Миграция старых задач без новых полей
                this.tasks.forEach(task => {
                    if (task.timeSpent === undefined) task.timeSpent = 0;
                    if (task.pomodoroSessions === undefined) task.pomodoroSessions = 0;
                    if (task.lastWorkedAt === undefined) task.lastWorkedAt = null;
                });
                this.saveTasks();
            } else {
                this.tasks = [];
            }
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            this.tasks = [];
        }
    },
    
    // Очистка при выходе из дашборда
    cleanup() {
        // Save data when switching modes
        this.saveTasks();
    },
    
    // Public methods for getting data (for analytics.js)
    getTasks() {
        return this.tasks;
    },
    
    getCompletedTasks() {
        return this.tasks.filter(t => t.completed);
    }
};

// Export module
window.TodoModule = TodoModule;