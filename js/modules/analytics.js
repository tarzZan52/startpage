// Модуль аналитики и прогресса
const AnalyticsModule = {
    charts: {
        pomodoro: null,
        habits: null,
        tasks: null
    },
    
    elements: {
        widget: null,
        pomodoroChart: null,
        habitsChart: null,
        tasksChart: null
    },
    
    init() {
        console.log('Initializing Analytics module...');
        this.createWidget();
        this.loadElements();
        this.setupEventListeners();
        this.initializeCharts();
        this.refreshData();
    },
    
    createWidget() {
        // Находим грид дашборда
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) {
            console.error('Dashboard grid not found');
            return;
        }
        
        // Создаем HTML виджета
        const widget = document.createElement('div');
        widget.className = 'widget analytics-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
                <h3>Analytics & Progress</h3>
                <button class="widget-settings-btn" id="analyticsRefreshBtn" title="Refresh data">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                </button>
            </div>
            
            <div class="analytics-content">
                <div class="analytics-section">
                    <h4 class="analytics-subtitle">🍅 Pomodoro Productivity</h4>
                    <div class="analytics-description">Focus time over the last 7 days</div>
                    <div class="chart-container">
                        <canvas id="pomodoroChart"></canvas>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h4 class="analytics-subtitle">✅ Habits Completion</h4>
                    <div class="analytics-description">Overall completion rate by habit</div>
                    <div class="chart-container">
                        <canvas id="habitsChart"></canvas>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h4 class="analytics-subtitle">📊 Task Completion History</h4>
                    <div class="analytics-description">Tasks completed over time</div>
                    <div class="chart-container">
                        <canvas id="tasksChart"></canvas>
                    </div>
                </div>
                
                <div class="analytics-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Focus Time</span>
                        <span class="summary-value" id="totalFocusTime">0h</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Tasks Completed</span>
                        <span class="summary-value" id="totalTasksCompleted">0</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Habits Streak</span>
                        <span class="summary-value" id="bestHabitStreak">0d</span>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем виджет в грид
        dashboardGrid.appendChild(widget);
        this.elements.widget = widget;
    },
    
    loadElements() {
        this.elements.pomodoroChart = document.getElementById('pomodoroChart');
        this.elements.habitsChart = document.getElementById('habitsChart');
        this.elements.tasksChart = document.getElementById('tasksChart');
        this.elements.refreshBtn = document.getElementById('analyticsRefreshBtn');
    },
    
    setupEventListeners() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshData();
                // Анимация кнопки обновления
                this.elements.refreshBtn.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    this.elements.refreshBtn.style.transform = 'rotate(0deg)';
                }, 500);
            });
        }
    },
    
    initializeCharts() {
        // Проверяем доступность Chart.js
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Инициализируем графики
        this.initPomodoroChart();
        this.initHabitsChart();
        this.initTasksChart();
    },
    
    initPomodoroChart() {
        if (!this.elements.pomodoroChart) return;
        
        const ctx = this.elements.pomodoroChart.getContext('2d');
        this.charts.pomodoro = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Focus Time (minutes)',
                    data: [],
                    backgroundColor: 'rgba(116, 188, 164, 0.6)',
                    borderColor: 'rgba(116, 188, 164, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} minutes`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    initHabitsChart() {
        if (!this.elements.habitsChart) return;
        
        const ctx = this.elements.habitsChart.getContext('2d');
        this.charts.habits = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.6)',
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(239, 68, 68, 0.6)',
                        'rgba(168, 85, 247, 0.6)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(168, 85, 247, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    initTasksChart() {
        if (!this.elements.tasksChart) return;
        
        const ctx = this.elements.tasksChart.getContext('2d');
        this.charts.tasks = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'With Pomodoro',
                        data: [],
                        borderColor: 'rgba(116, 188, 164, 1)',
                        backgroundColor: 'rgba(116, 188, 164, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Without Pomodoro',
                        data: [],
                        borderColor: 'rgba(156, 163, 175, 1)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} tasks`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    refreshData() {
        this.updatePomodoroChart();
        this.updateHabitsChart();
        this.updateTasksChart();
        this.updateSummaryStats();
    },
    
    updatePomodoroChart() {
        if (!this.charts.pomodoro || !window.PomodoroModule) return;
        
        // Получаем данные за последние 7 дней
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            labels.push(dayName);
            data.push(window.PomodoroModule.stats.daily[dateKey] || 0);
        }
        
        this.charts.pomodoro.data.labels = labels;
        this.charts.pomodoro.data.datasets[0].data = data;
        this.charts.pomodoro.update();
    },
    
    updateHabitsChart() {
        if (!this.charts.habits || !window.HabitsModule) return;
        
        const habits = window.HabitsModule.habits;
        const labels = [];
        const data = [];
        
        habits.forEach(habit => {
            labels.push(habit.name);
            const completionRate = window.HabitsModule.getCompletionRate(habit.id);
            data.push(completionRate);
        });
        
        // Если нет привычек, показываем заглушку
        if (labels.length === 0) {
            labels.push('No habits');
            data.push(100);
        }
        
        this.charts.habits.data.labels = labels;
        this.charts.habits.data.datasets[0].data = data;
        this.charts.habits.update();
    },
    
    updateTasksChart() {
        if (!this.charts.tasks || !window.TodoModule) return;
        
        const stats = window.TodoModule.getStatisticsData();
        const labels = [];
        const pomodoroData = [];
        const regularData = [];
        
        // Получаем данные за последние 14 дней
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            
            // Форматируем дату для отображения
            const label = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            labels.push(label);
            
            // Добавляем данные
            const dayStats = stats.daily[dateKey] || { withPomodoro: 0, withoutPomodoro: 0 };
            pomodoroData.push(dayStats.withPomodoro);
            regularData.push(dayStats.withoutPomodoro);
        }
        
        this.charts.tasks.data.labels = labels;
        this.charts.tasks.data.datasets[0].data = pomodoroData;
        this.charts.tasks.data.datasets[1].data = regularData;
        this.charts.tasks.update();
    },
    
    updateSummaryStats() {
        // Общее время фокусировки
        if (window.PomodoroModule) {
            const totalMinutes = Object.values(window.PomodoroModule.stats.daily)
                .reduce((sum, minutes) => sum + minutes, 0);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            document.getElementById('totalFocusTime').textContent = timeStr;
        }
        
        // Общее количество выполненных задач
        if (window.TodoModule) {
            const completedTasks = window.TodoModule.tasks.filter(t => t.completed).length;
            document.getElementById('totalTasksCompleted').textContent = completedTasks;
        }
        
        // Лучшая серия привычек
        if (window.HabitsModule) {
            let bestStreak = 0;
            window.HabitsModule.habits.forEach(habit => {
                const streak = window.HabitsModule.getStreak(habit.id);
                if (streak > bestStreak) {
                    bestStreak = streak;
                }
            });
            document.getElementById('bestHabitStreak').textContent = `${bestStreak}d`;
        }
    }
};

// Экспорт модуля
window.AnalyticsModule = AnalyticsModule;