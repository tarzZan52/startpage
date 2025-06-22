// Analytics and progress module
const AnalyticsModule = {
    charts: {
        pomodoro: null
    },
    
    elements: {
        widget: null,
        pomodoroChart: null,
        refreshBtn: null,
        totalFocusTime: null,
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
        this.elements.refreshBtn = this.elements.widget.querySelector('.analytics-refresh-btn');
        this.elements.totalFocusTime = this.elements.widget.querySelector('.total-focus-time');
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
    },
    
    initializeCharts() {
        // Check Chart.js availability
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Initialize charts
        this.initPomodoroChart();
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
    

    

    
    refreshData() {
        this.updatePomodoroChart();
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