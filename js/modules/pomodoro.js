// Модуль таймера Помодоро
const PomodoroModule = {
    // Настройки по умолчанию
    settings: {
        workTime: 25,
        shortBreak: 5,
        longBreak: 15,
        soundEnabled: true
    },
    
    // Состояние таймера
    state: {
        isRunning: false,
        isPaused: false,
        currentTime: 0,
        currentSession: 'work', // work, shortBreak, longBreak
        sessionsCompleted: 0,
        totalTime: 0,
        currentTaskId: null // ID текущей задачи
    },
    
    // DOM элементы
    elements: {
        timerTime: null,
        timerLabel: null,
        timerProgress: null,
        timerCircle: null,
        startBtn: null,
        pauseBtn: null,
        resetBtn: null,
        skipBtn: null,
        sessionsDisplay: null,
        workTimeInline: null,
        shortBreakInline: null,
        longBreakInline: null,
        soundEnabledInline: null,
        todayMinutes: null,
        weekMinutes: null,
        taskSelector: null
    },
    
    timer: null,
    
    init() {
        console.log('Initializing Pomodoro module...');
        this.loadElements();
        this.loadSettings();
        this.loadStats();
        this.updateDisplay();
        this.updateStatsDisplay();
        this.createNotificationSound();
        this.createTaskSelector();
        
        // Setup event listeners with delay to ensure DOM is ready
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
    },
    
    loadElements() {
        this.elements.timerTime = document.getElementById('timerTime');
        this.elements.timerLabel = document.getElementById('timerLabel');
        this.elements.timerProgress = document.getElementById('timerProgress');
        this.elements.timerCircle = document.querySelector('.timer-circle');
        this.elements.startBtn = document.getElementById('timerStart');
        this.elements.pauseBtn = document.getElementById('timerPause');
        this.elements.resetBtn = document.getElementById('timerReset');
        this.elements.skipBtn = document.getElementById('timerSkip');
        this.elements.sessionsDisplay = document.getElementById('pomodoroSessions');
        this.elements.workTimeInline = document.getElementById('workTimeInline');
        this.elements.shortBreakInline = document.getElementById('shortBreakInline');
        this.elements.longBreakInline = document.getElementById('longBreakInline');
        this.elements.soundEnabledInline = document.getElementById('soundEnabledInline');
        this.elements.todayMinutes = document.getElementById('todayMinutes');
        this.elements.weekMinutes = document.getElementById('weekMinutes');
        
        // Проверяем, что основные элементы найдены
        const requiredElements = ['timerTime', 'timerLabel', 'startBtn', 'pauseBtn'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            console.warn('Missing Pomodoro elements:', missingElements);
        }
    },
    
    createTaskSelector() {
        // Создаем селектор задач после таймера
        const timerContainer = document.querySelector('.pomodoro-timer');
        if (!timerContainer) return;
        
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'pomodoro-task-selector';
        selectorContainer.innerHTML = `
            <label for="pomodoroTaskSelect">Current task:</label>
            <select id="pomodoroTaskSelect" class="task-select">
                <option value="">No task selected</option>
            </select>
        `;
        
        // Вставляем после кругового таймера
        const timerCircle = timerContainer.querySelector('.timer-circle');
        if (timerCircle && timerCircle.nextSibling) {
            timerContainer.insertBefore(selectorContainer, timerCircle.nextSibling);
        } else {
            timerContainer.appendChild(selectorContainer);
        }
        
        this.elements.taskSelector = document.getElementById('pomodoroTaskSelect');
        this.updateTaskSelector();
    },
    
    updateTaskSelector() {
        if (!this.elements.taskSelector || !window.TodoModule) return;
        
        const activeTasks = window.TodoModule.getActiveTasks();
        const currentValue = this.elements.taskSelector.value;
        
        // Очищаем и заполняем селектор
        this.elements.taskSelector.innerHTML = '<option value="">No task selected</option>';
        
        activeTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            
            // Обрезаем длинный текст
            let taskText = task.text;
            if (taskText.length > 40) {
                taskText = taskText.substring(0, 40) + '...';
            }
            
            // Добавляем информацию о времени если есть
            if (task.timeSpent > 0) {
                taskText += ` (${window.TodoModule.formatTime(task.timeSpent)})`;
            }
            
            option.textContent = taskText;
            
            // Выделяем задачи с высоким приоритетом
            if (task.priority === 'high') {
                option.style.fontWeight = 'bold';
            }
            
            this.elements.taskSelector.appendChild(option);
        });
        
        // Восстанавливаем выбранное значение если оно все еще актуально
        if (currentValue && activeTasks.find(t => t.id == currentValue)) {
            this.elements.taskSelector.value = currentValue;
            this.state.currentTaskId = parseInt(currentValue);
        } else {
            this.state.currentTaskId = null;
        }
    },
    
    setupEventListeners() {
        console.log('Setting up Pomodoro event listeners...');
        
        // Кнопки управления таймером
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.reset());
        }
        if (this.elements.skipBtn) {
            this.elements.skipBtn.addEventListener('click', () => this.skip());
        }
        
        // Селектор задач
        if (this.elements.taskSelector) {
            this.elements.taskSelector.addEventListener('change', (e) => {
                this.state.currentTaskId = e.target.value ? parseInt(e.target.value) : null;
            });
        }
        
        // Настраиваем кнопку настроек
        this.setupSettingsMenu();
        
        // Кнопки +/- для времени (с задержкой для инициализации DOM)
        setTimeout(() => {
            document.querySelectorAll('.time-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = btn.dataset.target;
                    const input = document.getElementById(target);
                    const isPlus = btn.classList.contains('time-plus');
                    const isMinus = btn.classList.contains('time-minus');
                    
                    if (input && (isPlus || isMinus)) {
                        let value = parseInt(input.value);
                        const step = parseInt(input.step) || 1;
                        const min = parseInt(input.min);
                        const max = parseInt(input.max);
                        
                        if (isPlus && value < max) {
                            value += step;
                        } else if (isMinus && value > min) {
                            value -= step;
                        }
                        
                        input.value = value;
                        // Автоматически сохраняем при изменении
                        this.saveInlineSettings();
                        
                        // Если таймер не запущен, обновляем отображение
                        if (!this.state.isRunning && this.state.currentTime === 0) {
                            this.updateDisplay();
                            this.updateProgress();
                        }
                    }
                });
            });
        }, 150);
        
        // Настройки
        if (this.elements.workTimeInline) {
            this.elements.workTimeInline.addEventListener('change', () => {
                this.saveInlineSettings();
                if (!this.state.isRunning && this.state.currentTime === 0) {
                    this.updateDisplay();
                    this.updateProgress();
                }
            });
        }
        if (this.elements.shortBreakInline) {
            this.elements.shortBreakInline.addEventListener('change', () => {
                this.saveInlineSettings();
                if (!this.state.isRunning && this.state.currentTime === 0 && this.state.currentSession !== 'work') {
                    this.updateDisplay();
                    this.updateProgress();
                }
            });
        }
        if (this.elements.longBreakInline) {
            this.elements.longBreakInline.addEventListener('change', () => {
                this.saveInlineSettings();
                if (!this.state.isRunning && this.state.currentTime === 0 && this.state.currentSession === 'longBreak') {
                    this.updateDisplay();
                    this.updateProgress();
                }
            });
        }
        if (this.elements.soundEnabledInline) {
            this.elements.soundEnabledInline.addEventListener('change', () => this.saveInlineSettings());
        }
        
        // Кнопки статистики
        setTimeout(() => {
            const statsBtn = document.getElementById('pomodoroStatsBtn');
            const resetStatsBtn = document.getElementById('pomodoroResetStatsBtn');
            
            if (statsBtn) {
                statsBtn.addEventListener('click', () => this.showStatsModal());
            }
            if (resetStatsBtn) {
                resetStatsBtn.addEventListener('click', () => this.resetStats());
            }
        }, 150);
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.modal-overlay.active') || 
                document.querySelector('.habit-modal.active') ||
                document.querySelector('.pomodoro-settings-dropdown.active') ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
                !Dashboard.isActive) {
                return;
            }
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.reset();
            } else if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.skip();
            }
        });
        
        // Обновляем селектор задач при изменениях в TodoModule
        setInterval(() => {
            if (Dashboard.isActive) {
                this.updateTaskSelector();
            }
        }, 2000);
    },
    
    setupSettingsMenu() {
        // Избегаем множественного подключения обработчиков
        if (this.settingsMenuInitialized) {
            return;
        }
        
        const settingsBtn = document.getElementById('pomodoroSettingsBtn');
        const settingsDropdown = document.getElementById('pomodoroSettingsDropdown');
        
        console.log('Setting up pomodoro settings menu');
        console.log('Elements found:', { 
            settingsBtn: !!settingsBtn, 
            settingsDropdown: !!settingsDropdown
        });
        
        if (settingsBtn && settingsDropdown) {
            // Создаем обработчик клика
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Settings button clicked');
                
                const isActive = settingsDropdown.classList.contains('active');
                if (isActive) {
                    settingsDropdown.classList.remove('active');
                    console.log('Dropdown closed');
                } else {
                    settingsDropdown.classList.add('active');
                    console.log('Dropdown opened');
                }
            };
            
            settingsBtn.addEventListener('click', clickHandler);
            console.log('Event listener added to settings button');
            
            // Закрытие при клике вне меню
            const outsideClickHandler = (e) => {
                if (!settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
                    settingsDropdown.classList.remove('active');
                }
            };
            document.addEventListener('click', outsideClickHandler);
            
            // Закрытие по ESC
            const escKeyHandler = (e) => {
                if (e.key === 'Escape' && settingsDropdown.classList.contains('active')) {
                    settingsDropdown.classList.remove('active');
                }
            };
            document.addEventListener('keydown', escKeyHandler);
            
            this.settingsMenuInitialized = true;
            console.log('Pomodoro settings menu initialized successfully');
        } else {
            console.warn('Pomodoro settings elements not found:', { settingsBtn, settingsDropdown });
        }
    },
    
    start() {
        if (this.state.currentTime === 0) {
            this.state.currentTime = this.getCurrentSessionTime() * 60;
            this.state.totalTime = this.state.currentTime;
        }
        
        this.state.isRunning = true;
        this.state.isPaused = false;
        
        this.elements.startBtn.style.display = 'none';
        this.elements.pauseBtn.style.display = 'flex';
        
        // Добавляем класс активности для анимации
        if (this.elements.timerCircle) {
            this.elements.timerCircle.classList.add('active');
        }
        
        // Отключаем селектор задач во время работы
        if (this.elements.taskSelector) {
            this.elements.taskSelector.disabled = true;
        }
        
        this.timer = setInterval(() => {
            this.tick();
        }, 1000);
    },
    
    pause() {
        this.state.isRunning = false;
        this.state.isPaused = true;
        
        this.elements.startBtn.style.display = 'flex';
        this.elements.pauseBtn.style.display = 'none';
        
        // Убираем класс активности
        if (this.elements.timerCircle) {
            this.elements.timerCircle.classList.remove('active');
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
    
    reset() {
        this.pause();
        this.state.currentTime = 0;
        this.state.isPaused = false;
        
        // Включаем селектор задач
        if (this.elements.taskSelector) {
            this.elements.taskSelector.disabled = false;
        }
        
        this.updateDisplay();
        this.updateProgress();
    },
    
    tick() {
        this.state.currentTime--;
        this.updateDisplay();
        this.updateProgress();
        
        if (this.state.currentTime <= 0) {
            this.completeSession();
        }
    },
    
    skip() {
        if (this.state.isRunning || this.state.isPaused) {
            this.completeSession();
        }
    },
    
    completeSession() {
        this.pause();
        
        // Сохраняем статистику только для рабочих сессий
        if (this.state.currentSession === 'work') {
            this.updateStats();
            
            // Обновляем время задачи если она была выбрана
            if (this.state.currentTaskId && window.TodoModule) {
                window.TodoModule.updateTaskTime(this.state.currentTaskId, this.settings.workTime);
                
                // Обновляем аналитику
                if (window.AnalyticsModule) {
                    window.AnalyticsModule.refreshData();
                }
            }
        }
        
        if (this.settings.soundEnabled) {
            this.playNotificationSound();
        }
        
        // Показываем уведомление
        this.showNotification();
        
        // Переключаемся на следующую сессию
        this.switchToNextSession();
    },
    
    switchToNextSession() {
        if (this.state.currentSession === 'work') {
            this.state.sessionsCompleted++;
            
            // Каждые 4 рабочие сессии - длинный перерыв
            if (this.state.sessionsCompleted % 4 === 0) {
                this.state.currentSession = 'longBreak';
            } else {
                this.state.currentSession = 'shortBreak';
            }
        } else {
            this.state.currentSession = 'work';
        }
        
        // Включаем селектор задач для рабочих сессий
        if (this.elements.taskSelector) {
            this.elements.taskSelector.disabled = this.state.currentSession !== 'work';
        }
        
        this.state.currentTime = 0;
        this.updateDisplay();
        this.updateProgress();
    },
    
    getCurrentSessionTime() {
        switch (this.state.currentSession) {
            case 'work':
                return this.settings.workTime;
            case 'shortBreak':
                return this.settings.shortBreak;
            case 'longBreak':
                return this.settings.longBreak;
            default:
                return this.settings.workTime;
        }
    },
    
    getSessionLabel() {
        switch (this.state.currentSession) {
            case 'work':
                return 'Focus';
            case 'shortBreak':
                return 'Short Break';
            case 'longBreak':
                return 'Long Break';
            default:
                return 'Focus';
        }
    },
    
    updateDisplay() {
        const displayTime = this.state.currentTime || this.getCurrentSessionTime() * 60;
        const minutes = Math.floor(displayTime / 60);
        const seconds = displayTime % 60;
        
        this.elements.timerTime.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.elements.timerLabel.textContent = this.getSessionLabel();
        
        // Обновляем статистику
        this.elements.sessionsDisplay.textContent = this.state.sessionsCompleted;
        
        // Обновляем инлайн настройки
        this.updateInlineSettings();
    },
    
    updateProgress() {
        const totalTime = this.state.totalTime || this.getCurrentSessionTime() * 60;
        const currentTime = this.state.currentTime || totalTime;
        const progress = ((totalTime - currentTime) / totalTime) * 283; // 283 = 2πr где r=45
        
        if (this.elements.timerProgress) {
            const circle = this.elements.timerProgress.querySelector('circle:last-child');
            if (circle) {
                circle.style.strokeDashoffset = 283 - progress;
            }
        }
    },
    
    createNotificationSound() {
        // Создаем звук уведомления программно
        this.notificationSound = new AudioContext();
        
        this.playNotificationSound = () => {
            if (!this.settings.soundEnabled) return;
            
            try {
                const oscillator = this.notificationSound.createOscillator();
                const gainNode = this.notificationSound.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.notificationSound.destination);
                
                oscillator.frequency.setValueAtTime(800, this.notificationSound.currentTime);
                oscillator.frequency.setValueAtTime(600, this.notificationSound.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(800, this.notificationSound.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.1, this.notificationSound.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.notificationSound.currentTime + 0.3);
                
                oscillator.start(this.notificationSound.currentTime);
                oscillator.stop(this.notificationSound.currentTime + 0.3);
            } catch (error) {
                console.log('Не удалось воспроизвести звук:', error);
            }
        };
    },
    
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.state.currentSession === 'work' 
                ? 'Time for a break!' 
                : 'Time to work!';
                
            new Notification('Pomodoro', {
                body: message,
                icon: '/favicon.ico',
                silent: !this.settings.soundEnabled
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification();
                }
            });
        }
    },
    
    updateInlineSettings() {
        if (this.elements.workTimeInline) {
            this.elements.workTimeInline.value = this.settings.workTime;
        }
        if (this.elements.shortBreakInline) {
            this.elements.shortBreakInline.value = this.settings.shortBreak;
        }
        if (this.elements.longBreakInline) {
            this.elements.longBreakInline.value = this.settings.longBreak;
        }
        if (this.elements.soundEnabledInline) {
            this.elements.soundEnabledInline.checked = this.settings.soundEnabled;
        }
    },
    
    saveInlineSettings() {
        if (this.elements.workTimeInline) {
            this.settings.workTime = parseInt(this.elements.workTimeInline.value);
        }
        if (this.elements.shortBreakInline) {
            this.settings.shortBreak = parseInt(this.elements.shortBreakInline.value);
        }
        if (this.elements.longBreakInline) {
            this.settings.longBreak = parseInt(this.elements.longBreakInline.value);
        }
        if (this.elements.soundEnabledInline) {
            this.settings.soundEnabled = this.elements.soundEnabledInline.checked;
        }
        
        localStorage.setItem('pomodoro_settings', JSON.stringify(this.settings));
        
        // Обновляем отображение если таймер не запущен
        if (!this.state.isRunning && this.state.currentTime === 0) {
            this.updateDisplay();
            this.updateProgress();
        }
    },
    
    loadSettings() {
        const savedSettings = localStorage.getItem('pomodoro_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    },
    
    loadStats() {
        const stats = localStorage.getItem('pomodoro_stats');
        if (stats) {
            this.stats = JSON.parse(stats);
        } else {
            this.stats = {
                daily: {},
                weekly: {}
            };
        }
    },
    
    updateStats() {
        const today = new Date().toDateString();
        const weekStart = this.getWeekStart();
        
        // Обновляем дневную статистику
        if (!this.stats.daily[today]) {
            this.stats.daily[today] = 0;
        }
        this.stats.daily[today] += this.settings.workTime;
        
        // Обновляем недельную статистику
        if (!this.stats.weekly[weekStart]) {
            this.stats.weekly[weekStart] = 0;
        }
        this.stats.weekly[weekStart] += this.settings.workTime;
        
        // Сохраняем и обновляем отображение
        localStorage.setItem('pomodoro_stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    },
    
    updateStatsDisplay() {
        if (!this.elements.todayMinutes || !this.elements.weekMinutes) return;
        
        const today = new Date().toDateString();
        const weekStart = this.getWeekStart();
        
        const todayMinutes = this.stats.daily[today] || 0;
        const weekMinutes = this.stats.weekly[weekStart] || 0;
        
        this.elements.todayMinutes.textContent = `${todayMinutes} min`;
        this.elements.weekMinutes.textContent = `${weekMinutes} min`;
    },
    
    getWeekStart() {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
        const weekStart = new Date(date.setDate(diff));
        return weekStart.toDateString();
    },
    
    // Show statistics modal similar to habits tracker
    showStatsModal() {
        const modal = document.createElement('div');
        modal.className = 'habit-details-modal';
        modal.style.opacity = '1';
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        modal.innerHTML = `
            <div class="habit-details-content">
                <div class="habit-details-header">
                    <h3>
                        📊 Pomodoro Statistics
                    </h3>
                    <button class="habit-details-close" onclick="this.closest('.habit-details-modal').remove()">×</button>
                </div>
                
                <div class="habit-calendar">
                    <div class="calendar-navigation">
                        <button class="calendar-nav-btn" onclick="PomodoroModule.changeStatsMonth(-1)">‹</button>
                        <div class="calendar-month-year" id="pomodoroStatsMonthYear">${this.getMonthName(currentMonth)} ${currentYear}</div>
                        <button class="calendar-nav-btn" onclick="PomodoroModule.changeStatsMonth(1)">›</button>
                    </div>
                    <div id="pomodoroStatsCalendar">${this.renderStatsCalendar(currentMonth, currentYear)}</div>
                </div>
                
                <div class="habit-details-stats">
                    <div class="stat-item">
                        <div class="stat-label">This Month</div>
                        <div class="stat-value" id="pomodoroMonthMinutes">${this.getMonthMinutes(currentMonth, currentYear)} min</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">This Week</div>
                        <div class="stat-value">${this.getWeekMinutes()} min</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Today</div>
                        <div class="stat-value">${this.getTodayMinutes()} min</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Store current viewing month/year
        this.statsViewDate = { month: currentMonth, year: currentYear };
    },
    
    // Change stats viewing month
    changeStatsMonth(direction) {
        if (!this.statsViewDate) return;
        
        this.statsViewDate.month += direction;
        
        if (this.statsViewDate.month > 11) {
            this.statsViewDate.month = 0;
            this.statsViewDate.year++;
        } else if (this.statsViewDate.month < 0) {
            this.statsViewDate.month = 11;
            this.statsViewDate.year--;
        }
        
        // Update display
        const monthYearElement = document.getElementById('pomodoroStatsMonthYear');
        const calendarElement = document.getElementById('pomodoroStatsCalendar');
        const monthMinutesElement = document.getElementById('pomodoroMonthMinutes');
        
        if (monthYearElement) {
            monthYearElement.textContent = `${this.getMonthName(this.statsViewDate.month)} ${this.statsViewDate.year}`;
        }
        if (calendarElement) {
            calendarElement.innerHTML = this.renderStatsCalendar(this.statsViewDate.month, this.statsViewDate.year);
        }
        if (monthMinutesElement) {
            monthMinutesElement.textContent = `${this.getMonthMinutes(this.statsViewDate.month, this.statsViewDate.year)} min`;
        }
    },
    
    // Get month name
    getMonthName(month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month];
    },
    
    // Render calendar for statistics
    renderStatsCalendar(month, year) {
        const today = new Date();
        
        let html = '<div class="calendar-grid">';
        
        // Days of the week
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        daysOfWeek.forEach(day => {
            html += `<div class="calendar-header">${day}</div>`;
        });
        
        // First day of the month
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday (0) to 6
        
        // Empty cells before first day
        for (let i = 0; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toDateString();
            const minutes = this.stats.daily[dateKey] || 0;
            const isToday = date.toDateString() === today.toDateString();
            const isFuture = date > today;
            
            const intensity = minutes > 0 ? Math.min(Math.floor(minutes / 25) + 1, 4) : 0;
            
            html += `
                <div class="calendar-day ${minutes > 0 ? 'completed' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}" 
                     style="background: ${this.getIntensityColor(intensity)};"
                     title="${minutes} minutes worked">
                    ${day}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    // Get color intensity based on minutes worked
    getIntensityColor(intensity) {
        const colors = [
            'rgba(255, 255, 255, 0.05)',
            'rgba(116, 188, 164, 0.3)',
            'rgba(116, 188, 164, 0.5)',
            'rgba(116, 188, 164, 0.7)',
            'rgba(116, 188, 164, 0.9)'
        ];
        return colors[intensity] || colors[0];
    },
    
    // Get today's minutes
    getTodayMinutes() {
        const today = new Date().toDateString();
        return this.stats.daily[today] || 0;
    },
    
    // Get this week's minutes
    getWeekMinutes() {
        const weekStart = this.getWeekStart();
        return this.stats.weekly[weekStart] || 0;
    },
    
    // Get specific month's minutes
    getMonthMinutes(month, year) {
        let total = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toDateString();
            total += this.stats.daily[dateKey] || 0;
        }
        
        return total;
    },
    
    // Reset statistics
    resetStats() {
        if (confirm('Are you sure you want to reset all Pomodoro statistics? This action cannot be undone.')) {
            this.stats = {
                daily: {},
                weekly: {}
            };
            localStorage.setItem('pomodoro_stats', JSON.stringify(this.stats));
            this.updateStatsDisplay();
            
            // Close any open modals
            const modal = document.querySelector('.habit-details-modal');
            if (modal) {
                modal.remove();
            }
            
            alert('Statistics have been reset successfully.');
        }
    }
};

// Экспорт модуля
window.PomodoroModule = PomodoroModule;