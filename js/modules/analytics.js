// Analytics and progress module
const AnalyticsModule = {
    charts: {
        pomodoro: null,
        tasks: null
    },
    
    elements: {
        widget: null,
        pomodoroChart: null,
        tasksChart: null,
        refreshBtn: null,
        totalFocusTime: null,
        totalTasksCompleted: null,
        bestHabitStreak: null
    },
    
    init() {
        this.createWidgetFromTemplate();
        this.loadElements();
        this.setupEventListeners();
        this.setupEventBusListeners();
        this.initializeCharts();
        this.refreshData();
    },
    
    createWidgetFromTemplate() {
        // Find dashboard grid
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) {
            console.error('Dashboard grid not found');
            return;
        }
        
        // Get template
        const template = document.getElementById('analytics-widget-template');
        if (!template) {
            console.error('Analytics widget template not found');
            return;
        }
        
        // Clone template
        const clone = template.content.cloneNode(true);
        this.elements.widget = clone.querySelector('.analytics-widget');
        
        // Add to grid
        dashboardGrid.appendChild(clone);
    },
    
    loadElements() {
        if (!this.elements.widget) return;
        
        this.elements.pomodoroChart = this.elements.widget.querySelector('.pomodoro-chart');
        this.elements.tasksChart = this.elements.widget.querySelector('.tasks-chart');
        this.elements.refreshBtn = this.elements.widget.querySelector('.analytics-refresh-btn');
        this.elements.totalFocusTime = this.elements.widget.querySelector('.total-focus-time');
        this.elements.totalTasksCompleted = this.elements.widget.querySelector('.total-tasks-completed');
        this.elements.bestHabitStreak = this.elements.widget.querySelector('.best-habit-streak');
    },
    
    setupEventListeners() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshData();
                // Refresh button animation
                this.elements.refreshBtn.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    this.elements.refreshBtn.style.transform = 'rotate(0deg)';
                }, 500);
            });
        }
    },
    
    setupEventBusListeners() {
        // Subscribe to events from other modules
        EventBus.on('pomodoro:session-completed', () => {
            this.updatePomodoroChart();
            this.updateSummaryStats();
        });
        
        EventBus.on('tasks:updated', () => {
            this.updateTasksChart();
            this.updateSummaryStats();
        });
    },
    
    initializeCharts() {
        // Check Chart.js availability
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Initialize charts
        this.initPomodoroChart();
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
        this.updateTasksChart();
        this.updateSummaryStats();
    },
    
    updatePomodoroChart() {
        if (!this.charts.pomodoro || !window.PomodoroModule) return;
        
        // Get data for the last 7 days
        const labels = [];
        const data = [];
        const today = new Date();
        const dailyStats = window.PomodoroModule.getDailyStats();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            labels.push(dayName);
            data.push(dailyStats[dateKey] || 0);
        }
        
        this.charts.pomodoro.data.labels = labels;
        this.charts.pomodoro.data.datasets[0].data = data;
        this.charts.pomodoro.update();
    },
    

    
    updateTasksChart() {
        if (!this.charts.tasks || !window.TodoModule) return;
        
        const stats = window.TodoModule.getStatisticsData() || { daily: {} };
        const labels = [];
        const pomodoroData = [];
        const regularData = [];
        
        // Get data for the last 14 days
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            
            // Format date for display
            const label = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            labels.push(label);
            
            // Add data
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
        // Total focus time
        if (window.PomodoroModule && this.elements.totalFocusTime) {
            const dailyStats = window.PomodoroModule.getDailyStats();
            const totalMinutes = Object.values(dailyStats)
                .reduce((sum, minutes) => sum + minutes, 0);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            this.elements.totalFocusTime.textContent = timeStr;
        }
        
        // Total completed tasks
        if (window.TodoModule && this.elements.totalTasksCompleted) {
            const completedTasks = window.TodoModule.getCompletedTasks().length;
            this.elements.totalTasksCompleted.textContent = completedTasks;
        }
        
        // Best habit streak
        if (window.HabitsModule && this.elements.bestHabitStreak) {
            let bestStreak = 0;
            const habits = window.HabitsModule.getHabits();
            habits.forEach(habit => {
                const streak = window.HabitsModule.getHabitStreak(habit.id);
                if (streak > bestStreak) {
                    bestStreak = streak;
                }
            });
            this.elements.bestHabitStreak.textContent = `${bestStreak}d`;
        }
    }
};

// Export module
window.AnalyticsModule = AnalyticsModule;