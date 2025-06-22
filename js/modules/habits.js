// Модуль трекера привычек
const HabitsModule = {
    habits: [],
    habitLogs: {},
    
    elements: {
        habitsList: null,
        addBtn: null,
        statsContainer: null,
        modalOverlay: null
    },
    
    init() {
        this.loadElements();
        this.loadData();
        this.setupEventListeners();
        this.render();
        this.updateStats();
    },
    
    loadElements() {
        this.elements.habitsList = document.getElementById('habitsList');
        this.elements.addBtn = document.getElementById('addHabitBtn');
        this.elements.statsContainer = document.getElementById('habitsStats');
        this.elements.modalOverlay = document.getElementById('habitModal');
    },
    
    setupEventListeners() {
        // Добавление новой привычки
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.openModal());
        }
        
        // Закрытие модального окна
        const modalClose = document.getElementById('habitModalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Клик по оверлею
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        // Форма добавления привычки
        const habitForm = document.getElementById('habitForm');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveHabit();
            });
        }
        
        // Цветовые кнопки
        const colorButtons = document.querySelectorAll('.habit-color-option');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        
        // Кнопки изменения цели в модальном окне
        const targetMinusBtn = document.getElementById('habitTargetMinus');
        const targetPlusBtn = document.getElementById('habitTargetPlus');
        const targetInput = document.getElementById('habitTarget');
        
        if (targetMinusBtn && targetPlusBtn && targetInput) {
            targetMinusBtn.addEventListener('click', () => {
                const currentValue = parseInt(targetInput.value);
                if (currentValue > 1) {
                    targetInput.value = currentValue - 1;
                }
            });
            
            targetPlusBtn.addEventListener('click', () => {
                const currentValue = parseInt(targetInput.value);
                if (currentValue < 7) {
                    targetInput.value = currentValue + 1;
                }
            });
        }
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (!Dashboard.isActive || this.elements.modalOverlay?.classList.contains('active')) {
                return;
            }
            
            // Ctrl/Cmd + H - новая привычка
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.openModal();
            }
        });
    },
    
    loadData() {
        try {
            const savedHabits = localStorage.getItem('habits_data');
            const savedLogs = localStorage.getItem('habits_logs');
            
            if (savedHabits) {
                this.habits = JSON.parse(savedHabits);
            } else {
                // Дефолтные привычки для новых пользователей
                const now = Date.now();
                this.habits = [
                    {
                        id: now,
                        name: 'Утренняя зарядка',
                        icon: '🏃',
                        color: '#22c55e',
                        frequency: 'daily',
                        target: 7,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: now + 1,
                        name: 'Медитация',
                        icon: '🧘',
                        color: '#3b82f6',
                        frequency: 'daily',
                        target: 7,
                        createdAt: new Date().toISOString()
                    }
                ];
                this.saveData();
            }
            
            if (savedLogs) {
                this.habitLogs = JSON.parse(savedLogs);
            }
            
            // Очистка старых логов (старше 90 дней)
            this.cleanOldLogs();
            
        } catch (error) {
            console.error('Error loading habits:', error);
            this.habits = [];
            this.habitLogs = {};
        }
    },
    
    saveData() {
        try {
            localStorage.setItem('habits_data', JSON.stringify(this.habits));
            localStorage.setItem('habits_logs', JSON.stringify(this.habitLogs));
        } catch (error) {
            console.error('Error saving habits:', error);
        }
    },
    
    render() {
        if (!this.elements.habitsList) return;
        
        this.elements.habitsList.innerHTML = '';
        
        if (this.habits.length === 0) {
            this.elements.habitsList.innerHTML = `
                <div class="habits-empty">
                    <div class="habits-empty-icon">🎯</div>
                    <div class="habits-empty-text">Нет привычек. Добавьте первую!</div>
                </div>
            `;
            return;
        }
        
        this.habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            this.elements.habitsList.appendChild(habitElement);
        });
    },
    
    createHabitElement(habit) {
        const item = document.createElement('div');
        item.className = 'habit-item';
        
        const today = this.getDateKey(new Date());
        const isCompleted = this.isHabitCompleted(habit.id, today);
        const streak = this.getStreak(habit.id);
        const weekProgress = this.getWeekProgress(habit.id);
        const completionRate = this.getCompletionRate(habit.id);
        
        item.innerHTML = `
            <div class="habit-header">
                <div class="habit-icon" style="background: ${habit.color}20; color: ${habit.color}">
                    ${habit.icon}
                </div>
                <div class="habit-info">
                    <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                    <div class="habit-stats">
                        <span class="habit-streak" title="Текущая серия">
                            🔥 ${streak} ${this.getDayWord(streak)}
                        </span>
                        <span class="habit-rate" title="Процент выполнения за последние 30 дней">
                            ${completionRate}%
                        </span>
                    </div>
                </div>
                <button class="habit-check ${isCompleted ? 'checked' : ''}" 
                        data-id="${habit.id}" 
                        style="--habit-color: ${habit.color}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </button>
            </div>
            
            <div class="habit-progress">
                <div class="habit-week">
                    ${this.renderWeekProgress(habit.id)}
                </div>
                <div class="habit-progress-bar">
                    <div class="habit-progress-fill" 
                         style="width: ${(weekProgress.completed / habit.target) * 100}%; background: ${habit.color}">
                    </div>
                </div>
                <div class="habit-progress-text">
                    ${weekProgress.completed} of ${habit.target} this week
                </div>
            </div>
            
            <div class="habit-actions">
                <button class="habit-action-btn" data-action="details" data-habit-id="${habit.id}" title="Подробности">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button class="habit-action-btn" data-action="edit" data-habit-id="${habit.id}" title="Редактировать">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="habit-action-btn habit-delete" data-action="delete" data-habit-id="${habit.id}" title="Удалить">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19 6l-2 14H7L5 6"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Обработчик клика по чекбоксу
        const checkBtn = item.querySelector('.habit-check');
        checkBtn.addEventListener('click', () => this.toggleHabit(habit.id));
        
        // Обработчики для кнопок действий
        const actionBtns = item.querySelectorAll('.habit-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.dataset.action;
                const habitId = btn.dataset.habitId;
                
                switch(action) {
                    case 'details':
                        this.showDetails(habitId);
                        break;
                    case 'edit':
                        this.editHabit(habitId);
                        break;
                    case 'delete':
                        this.deleteHabit(habitId);
                        break;
                }
            });
        });
        
        return item;
    },
    
    renderWeekProgress(habitId) {
        const today = new Date();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let html = '';
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            const isCompleted = this.isHabitCompleted(habitId, dateKey);
            const isToday = i === 0;
            const dayIndex = (date.getDay() + 6) % 7; // Transform Sunday (0) to 6
            
            html += `
                <div class="habit-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                     title="${days[dayIndex]}, ${date.toLocaleDateString('en-US')}">
                    <div class="habit-day-label">${days[dayIndex]}</div>
                    <div class="habit-day-marker"></div>
                </div>
            `;
        }
        
        return html;
    },
    
    toggleHabit(habitId) {
        const today = this.getDateKey(new Date());
        
        if (!this.habitLogs[habitId]) {
            this.habitLogs[habitId] = {};
        }
        
        if (this.habitLogs[habitId][today]) {
            delete this.habitLogs[habitId][today];
        } else {
            this.habitLogs[habitId][today] = {
                completed: true,
                timestamp: new Date().toISOString()
            };
        }
        
        this.saveData();
        this.render();
        this.updateStats();
        
        // Анимация при отметке
        const checkBtn = document.querySelector(`.habit-check[data-id="${habitId}"]`);
        if (checkBtn) {
            checkBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                checkBtn.style.transform = 'scale(1)';
            }, 200);
        }
    },
    
    getStreak(habitId) {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.isHabitCompleted(habitId, dateKey)) {
                streak++;
            } else if (i > 0) {
                // Прерываем только если это не сегодня
                break;
            }
        }
        
        return streak;
    },
    
    getWeekProgress(habitId) {
        let completed = 0;
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.isHabitCompleted(habitId, dateKey)) {
                completed++;
            }
        }
        
        return { completed, total: 7 };
    },
    
    getCompletionRate(habitId) {
        let completed = 0;
        const days = 30;
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = this.getDateKey(date);
            
            if (this.isHabitCompleted(habitId, dateKey)) {
                completed++;
            }
        }
        
        return Math.round((completed / days) * 100);
    },
    
    isHabitCompleted(habitId, dateKey) {
        return this.habitLogs[habitId] && this.habitLogs[habitId][dateKey];
    },
    
    getDateKey(date) {
        // Используем локальную дату вместо UTC чтобы избежать смещения дня
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    getDayWord(count) {
        if (count === 1) {
            return 'day';
        }
        
        return 'days';
    },
    
    openModal(habitId = null) {
        this.currentEditId = habitId;
        
        if (habitId) {
            const habit = this.habits.find(h => h.id === habitId);
            if (habit) {
                document.getElementById('habitName').value = habit.name;
                document.getElementById('habitIcon').value = habit.icon;
                document.getElementById('habitTarget').value = habit.target;
                
                // Устанавливаем выбранный цвет
                document.querySelectorAll('.habit-color-option').forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.color === habit.color);
                });
            }
        } else {
            document.getElementById('habitForm').reset();
            document.querySelector('.habit-color-option').classList.add('selected');
        }
        
        this.elements.modalOverlay.classList.add('active');
        setTimeout(() => {
            document.getElementById('habitName').focus();
        }, 100);
    },
    
    closeModal() {
        this.elements.modalOverlay.classList.remove('active');
        this.currentEditId = null;
    },
    
    saveHabit() {
        const name = document.getElementById('habitName').value.trim();
        const icon = document.getElementById('habitIcon').value.trim() || '🎯';
        const target = parseInt(document.getElementById('habitTarget').value) || 7;
        const color = document.querySelector('.habit-color-option.selected').dataset.color;
        
        if (!name) {
            alert('Enter habit name');
            return;
        }
        
        if (this.currentEditId) {
            // Редактирование
            const habit = this.habits.find(h => h.id === this.currentEditId);
            if (habit) {
                habit.name = name;
                habit.icon = icon;
                habit.target = target;
                habit.color = color;
            }
        } else {
            // Новая привычка
            const newHabit = {
                id: Date.now(),
                name,
                icon,
                color,
                frequency: 'daily',
                target,
                createdAt: new Date().toISOString()
            };
            
            this.habits.unshift(newHabit);
        }
        
        this.saveData();
        this.render();
        this.updateStats();
        this.closeModal();
    },
    
    editHabit(habitId) {
        // Преобразуем habitId в число если это строка
        const id = typeof habitId === 'string' ? parseInt(habitId) : habitId;
        this.openModal(id);
    },
    
    deleteHabit(habitId) {
        // Преобразуем habitId в число если это строка
        const id = typeof habitId === 'string' ? parseInt(habitId) : habitId;
        const habit = this.habits.find(h => h.id === id);
        
        if (!habit) {
            console.warn('Habit not found for deletion:', habitId, 'Available habits:', this.habits.map(h => h.id));
            return;
        }
        
        if (confirm(`Delete habit "${habit.name}"? Completion history will also be deleted.`)) {
            this.habits = this.habits.filter(h => h.id !== id);
            delete this.habitLogs[id];
            
            this.saveData();
            this.render();
            this.updateStats();
        }
    },
    
    showDetails(habitId) {
        // Преобразуем habitId в число если это строка
        const id = typeof habitId === 'string' ? parseInt(habitId) : habitId;
        const habit = this.habits.find(h => h.id === id);
        
        if (!habit) {
            console.warn('Habit not found for details:', habitId, 'Available habits:', this.habits.map(h => h.id));
            return;
        }
        
        // Состояние календаря
        this.calendarState = {
            habitId: id,
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear()
        };
        
        // Создаем модальное окно с календарем
        const modal = document.createElement('div');
        modal.className = 'habit-details-modal';
        modal.innerHTML = `
            <div class="habit-details-content">
                <div class="habit-details-header">
                    <h3>${habit.icon} ${this.escapeHtml(habit.name)}</h3>
                    <button class="habit-details-close">✕</button>
                </div>
                <div class="habit-calendar">
                    <div class="calendar-navigation">
                        <button class="calendar-nav-btn" id="prevMonth">‹</button>
                        <div class="calendar-month-year" id="calendarMonthYear"></div>
                        <button class="calendar-nav-btn" id="nextMonth">›</button>
                    </div>
                    <div id="calendarGrid"></div>
                </div>
                <div class="habit-details-stats">
                    <div class="stat-item">
                        <div class="stat-label">Best Streak</div>
                        <div class="stat-value">${this.getBestStreak(id)} ${this.getDayWord(this.getBestStreak(id))}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total Completed</div>
                        <div class="stat-value">${this.getTotalCompleted(id)} times</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Created</div>
                        <div class="stat-value">${new Date(habit.createdAt).toLocaleDateString('en-US')}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Инициализируем календарь
        this.updateCalendar();
        
        // Обработчики навигации календаря
        const prevBtn = modal.querySelector('#prevMonth');
        const nextBtn = modal.querySelector('#nextMonth');
        
        prevBtn.addEventListener('click', () => {
            this.calendarState.currentMonth--;
            if (this.calendarState.currentMonth < 0) {
                this.calendarState.currentMonth = 11;
                this.calendarState.currentYear--;
            }
            this.updateCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            this.calendarState.currentMonth++;
            if (this.calendarState.currentMonth > 11) {
                this.calendarState.currentMonth = 0;
                this.calendarState.currentYear++;
            }
            this.updateCalendar();
        });
        
        // Анимация появления
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Закрытие модального окна
        const closeBtn = modal.querySelector('.habit-details-close');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        // Закрытие по ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },
    
    updateCalendar() {
        const monthYearElement = document.getElementById('calendarMonthYear');
        const calendarGrid = document.getElementById('calendarGrid');
        
        if (!monthYearElement || !calendarGrid) return;
        
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        monthYearElement.textContent = `${months[this.calendarState.currentMonth]} ${this.calendarState.currentYear}`;
        calendarGrid.innerHTML = this.renderCalendar(this.calendarState.habitId, this.calendarState.currentMonth, this.calendarState.currentYear);
    },
    
    renderCalendar(habitId, month = new Date().getMonth(), year = new Date().getFullYear()) {
        const today = new Date();
        
        let html = '<div class="calendar-grid">';
        
        // Days of the week
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        daysOfWeek.forEach(day => {
            html += `<div class="calendar-header">${day}</div>`;
        });
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Преобразуем воскресенье (0) в 6
        
        // Пустые ячейки до первого дня
        for (let i = 0; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Дни месяца
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = this.getDateKey(date);
            const isCompleted = this.isHabitCompleted(habitId, dateKey);
            const isToday = date.toDateString() === today.toDateString();
            const isFuture = date > today;
            
            html += `
                <div class="calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}">
                    ${day}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    getBestStreak(habitId) {
        let bestStreak = 0;
        let currentStreak = 0;
        const logs = this.habitLogs[habitId] || {};
        const sortedDates = Object.keys(logs).sort();
        
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
                currentStreak = 1;
            } else {
                const prevDate = new Date(sortedDates[i - 1]);
                const currDate = new Date(sortedDates[i]);
                const diffTime = Math.abs(currDate - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    bestStreak = Math.max(bestStreak, currentStreak);
                    currentStreak = 1;
                }
            }
        }
        
        return Math.max(bestStreak, currentStreak, this.getStreak(habitId));
    },
    
    getTotalCompleted(habitId) {
        const logs = this.habitLogs[habitId] || {};
        return Object.keys(logs).length;
    },
    
    updateStats() {
        if (!this.elements.statsContainer) return;
        
        const totalHabits = this.habits.length;
        const todayCompleted = this.habits.filter(h => {
            const today = this.getDateKey(new Date());
            return this.isHabitCompleted(h.id, today);
        }).length;
        
        const completionRate = totalHabits > 0 
            ? Math.round((todayCompleted / totalHabits) * 100) 
            : 0;
        
        this.elements.statsContainer.innerHTML = `
            <span title="Completed today">${todayCompleted}/${totalHabits}</span>
            <span class="stats-separator">•</span>
            <span title="Completion rate">${completionRate}%</span>
        `;
    },
    
    cleanOldLogs() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        Object.keys(this.habitLogs).forEach(habitId => {
            Object.keys(this.habitLogs[habitId]).forEach(dateKey => {
                if (new Date(dateKey) < ninetyDaysAgo) {
                    delete this.habitLogs[habitId][dateKey];
                }
            });
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Экспорт модуля
window.HabitsModule = HabitsModule;