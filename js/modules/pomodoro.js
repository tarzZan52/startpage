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
        totalTime: 0
    },
    
    // Статистика продуктивности
    stats: {
        today: 0,
        week: 0,
        history: {}
    },
    
    // DOM элементы
    elements: {
        timerTime: null,
        timerLabel: null,
        timerProgress: null,
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
        weekMinutes: null
    },
    
    timer: null,
    
    init() {
        this.loadElements();
        this.loadSettings();
        this.loadStats();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateProductivityStats();
        this.createNotificationSound();
    },
    
    loadElements() {
        this.elements.timerTime = document.getElementById('timerTime');
        this.elements.timerLabel = document.getElementById('timerLabel');
        this.elements.timerProgress = document.getElementById('timerProgress');
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
    },
    
    setupEventListeners() {
        // Кнопки управления таймером
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.skipBtn.addEventListener('click', () => this.skip());
        
        // Инлайн настройки
        this.elements.workTimeInline.addEventListener('change', () => this.saveInlineSettings());
        this.elements.shortBreakInline.addEventListener('change', () => this.saveInlineSettings());
        this.elements.longBreakInline.addEventListener('change', () => this.saveInlineSettings());
        this.elements.soundEnabledInline.addEventListener('change', () => this.saveInlineSettings());
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.modal-overlay.active') || 
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
        
        this.timer = setInterval(() => {
            this.tick();
        }, 1000);
    },
    
    pause() {
        this.state.isRunning = false;
        this.state.isPaused = true;
        
        this.elements.startBtn.style.display = 'flex';
        this.elements.pauseBtn.style.display = 'none';
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },
    
    reset() {
        this.pause();
        this.state.currentTime = 0;
        this.state.isPaused = false;
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
        
        // Обновляем статистику если завершена рабочая сессия
        if (this.state.currentSession === 'work') {
            this.updateStats(this.settings.workTime);
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
                return 'Фокус';
            case 'shortBreak':
                return 'Короткий перерыв';
            case 'longBreak':
                return 'Длинный перерыв';
            default:
                return 'Фокус';
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
        
        this.elements.timerProgress.style.strokeDashoffset = 283 - progress;
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
                ? 'Время для перерыва!' 
                : 'Время работать!';
                
            new Notification('Помодоро', {
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
        this.elements.workTimeInline.value = this.settings.workTime;
        this.elements.shortBreakInline.value = this.settings.shortBreak;
        this.elements.longBreakInline.value = this.settings.longBreak;
        this.elements.soundEnabledInline.checked = this.settings.soundEnabled;
    },
    
    saveInlineSettings() {
        this.settings.workTime = parseInt(this.elements.workTimeInline.value);
        this.settings.shortBreak = parseInt(this.elements.shortBreakInline.value);
        this.settings.longBreak = parseInt(this.elements.longBreakInline.value);
        this.settings.soundEnabled = this.elements.soundEnabledInline.checked;
        
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
        const savedStats = localStorage.getItem('pomodoro_stats');
        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
        this.cleanOldStats();
        this.calculateWeekStats();
    },
    
    saveStats() {
        localStorage.setItem('pomodoro_stats', JSON.stringify(this.stats));
    },
    
    updateStats(minutes) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.stats.history[today]) {
            this.stats.history[today] = 0;
        }
        
        this.stats.history[today] += minutes;
        this.stats.today = this.stats.history[today];
        
        this.calculateWeekStats();
        this.saveStats();
        this.updateProductivityStats();
    },
    
    calculateWeekStats() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        this.stats.week = 0;
        
        Object.entries(this.stats.history).forEach(([date, minutes]) => {
            const dateObj = new Date(date);
            if (dateObj >= weekAgo && dateObj <= today) {
                this.stats.week += minutes;
            }
        });
        
        // Обновляем сегодняшнюю статистику
        const todayKey = today.toISOString().split('T')[0];
        this.stats.today = this.stats.history[todayKey] || 0;
    },
    
    cleanOldStats() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        Object.keys(this.stats.history).forEach(date => {
            if (new Date(date) < monthAgo) {
                delete this.stats.history[date];
            }
        });
    },
    
    updateProductivityStats() {
        if (this.elements.todayMinutes) {
            const hours = Math.floor(this.stats.today / 60);
            const minutes = this.stats.today % 60;
            if (hours > 0) {
                this.elements.todayMinutes.textContent = `${hours}ч ${minutes}м`;
            } else {
                this.elements.todayMinutes.textContent = `${minutes} мин`;
            }
        }
        
        if (this.elements.weekMinutes) {
            const hours = Math.floor(this.stats.week / 60);
            const minutes = this.stats.week % 60;
            if (hours > 0) {
                this.elements.weekMinutes.textContent = `${hours}ч ${minutes}м`;
            } else {
                this.elements.weekMinutes.textContent = `${minutes} мин`;
            }
        }
    }
}; 

// Экспорт модуля
window.PomodoroModule = PomodoroModule; 