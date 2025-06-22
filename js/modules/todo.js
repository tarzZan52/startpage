// Модуль управления задачами
const TodoModule = {
    tasks: [],
    currentFilter: 'all',
    
    // DOM элементы
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
    
    // Инициализация модуля
    init() {
        this.loadElements();
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    },
    
    // Загрузка DOM элементов
    loadElements() {
        this.elements.input = document.getElementById('todoInput');
        this.elements.addBtn = document.getElementById('todoAddBtn');
        this.elements.list = document.getElementById('todoList');
        this.elements.stats = document.getElementById('todoStats');
        this.elements.prioritySelect = document.getElementById('todoPriority');
        this.elements.filters = document.querySelectorAll('.todo-filter');
        this.elements.clearCompleted = document.getElementById('todoClearCompleted');
        this.elements.deadlineInput = document.getElementById('todoDeadline');
    },
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Добавление задачи
        this.elements.addBtn.addEventListener('click', () => this.addTask());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Фильтры
        this.elements.filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Очистка выполненных
        this.elements.clearCompleted.addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // Глобальные горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (!Dashboard.isActive || 
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }
            
            // Ctrl/Cmd + Enter - добавить задачу
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.elements.input.focus();
            }
        });
    },
    
    // Добавление новой задачи
    addTask() {
        const text = this.elements.input.value.trim();
        if (!text) return;
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: this.elements.prioritySelect.value,
            deadline: this.elements.deadlineInput.value || null,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.unshift(task); // Добавляем в начало
        this.saveTasks();
        this.render();
        
        // Очистка формы
        this.elements.input.value = '';
        this.elements.prioritySelect.value = 'medium';
        this.elements.deadlineInput.value = '';
        
        // Анимация добавления
        this.animateTaskAdd();
    },
    
    // Переключение состояния задачи
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    },
    
    // Удаление задачи
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    },
    
    // Редактирование задачи
    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
        }
    },
    
    // Изменение приоритета задачи
    changePriority(id, newPriority) {
        const task = this.tasks.find(t => t.id !== id);
        if (task) {
            task.priority = newPriority;
            this.saveTasks();
            this.render();
        }
    },
    
    // Установка фильтра
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Обновление активного фильтра
        this.elements.filters.forEach(f => {
            f.classList.toggle('active', f.dataset.filter === filter);
        });
        
        this.render();
    },
    
    // Очистка выполненных задач
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        if (confirm(`Удалить ${completedCount} выполненных задач?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    },
    
    // Получение отфильтрованных задач
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
        
        // Сортировка: сначала по выполнению, потом по дедлайну, потом по приоритету, потом по дате
        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Сортировка по дедлайну (ближайшие первые)
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
    
    // Создание HTML элемента задачи
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
        
        // Определяем статус дедлайна
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
                deadlineText = `Просрочено на ${Math.abs(daysLeft)} дн.`;
            } else if (daysLeft === 0) {
                deadlineClass += ' soon';
                deadlineText = 'Сегодня';
            } else if (daysLeft === 1) {
                deadlineClass += ' soon';
                deadlineText = 'Завтра';
            } else if (daysLeft <= 3) {
                deadlineClass += ' soon';
                deadlineText = `Через ${daysLeft} дн.`;
            } else {
                deadlineText = deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            }
            
            deadlineHtml = `<span class="${deadlineClass}">📅 ${deadlineText}</span>`;
        }
        
        item.innerHTML = `
            <div class="todo-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            </div>
            <div class="todo-text" data-id="${task.id}">${this.escapeHtml(task.text)}</div>
            ${deadlineHtml}
            <div class="todo-priority" title="Приоритет: ${task.priority}">${priorityDots[task.priority]}</div>
            <button class="todo-delete" data-id="${task.id}" title="Удалить задачу">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19 6l-2 14H7L5 6"></path>
                </svg>
            </button>
        `;
        
        // Обработчики событий
        const checkbox = item.querySelector('.todo-checkbox');
        const text = item.querySelector('.todo-text');
        const deleteBtn = item.querySelector('.todo-delete');
        
        checkbox.addEventListener('click', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });
        
        // Редактирование по двойному клику
        text.addEventListener('dblclick', () => this.startEdit(task.id, text));
        
        return item;
    },
    
    // Начало редактирования задачи
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
    
    // Анимация добавления задачи
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
    
    // Отрисовка списка задач
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Очистка списка
        this.elements.list.innerHTML = '';
        
        // Добавление задач
        if (filteredTasks.length === 0) {
            this.elements.list.innerHTML = this.getEmptyMessage();
        } else {
            filteredTasks.forEach(task => {
                this.elements.list.appendChild(this.createTaskElement(task));
            });
        }
        
        // Обновление статистики
        this.updateStats();
        
        // Обновление кнопки очистки
        const completedCount = this.tasks.filter(t => t.completed).length;
        this.elements.clearCompleted.style.display = completedCount > 0 ? 'block' : 'none';
    },
    
    // Сообщение о пустом списке
    getEmptyMessage() {
        const messages = {
            all: 'Нет задач. Добавьте первую!',
            active: 'Все задачи выполнены! 🎉',
            completed: 'Нет выполненных задач'
        };
        
        return `
            <div class="todo-empty">
                <div class="todo-empty-icon">📝</div>
                <div class="todo-empty-text">${messages[this.currentFilter]}</div>
            </div>
        `;
    },
    
    // Обновление статистики
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        this.elements.stats.textContent = `${completed}/${total}`;
        
        // Показать процент выполнения
        if (total > 0) {
            const percent = Math.round((completed / total) * 100);
            this.elements.stats.title = `Выполнено ${percent}% (${active} активных)`;
        }
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
            this.tasks = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            this.tasks = [];
        }
    },
    
    // Очистка при выходе из дашборда
    cleanup() {
        // Сохраняем данные при смене режима
        this.saveTasks();
    }
};

// Экспорт модуля
window.TodoModule = TodoModule; 