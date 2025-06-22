// Модуль трекера привычек
const HabitsModule = {
    habits: [],
    todayData: {},
    streakData: {},
    
    elements: {
        list: null,
        addBtn: null,
        currentStreak: null,
        bestStreak: null
    },
    
    init() {
        this.loadElements();
        this.loadData();
        this.setupEventListeners();
        this.render();
        this.updateStreaks();
    },
    
    loadElements() {
        this.elements.list = document.getElementById('habitsList');
        this.elements.addBtn = document.getElementById('addHabitBtn');
        this.elements.currentStreak = document.getElementById('currentStreak');
        this.elements.bestStreak = document.getElementById('bestStreak');
    },
    
    setupEventListeners() {
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.addHabit());
        }
    },
    
    loadData() {
        const savedHabits = localStorage.getItem('habits_data');
        if (savedHabits) {
            this.habits = JSON.parse(savedHabits);
        }
        
        const today = this.getTodayDate();
        const savedToday = localStorage.getItem('habits_today');
        if (savedToday) {
            const data = JSON.parse(savedToday);
            if (data.date === today) {
                this.todayData = data.habits || {};
            } else {
                this.todayData = {};
            }
        }
        
        const savedStreaks = localStorage.getItem('habits_streaks');
        if (savedStreaks) {
            this.streakData = JSON.parse(savedStreaks);
        }
    },
    
    saveData() {
        localStorage.setItem('habits_data', JSON.stringify(this.habits));
        localStorage.setItem('habits_today', JSON.stringify({
            date: this.getTodayDate(),
            habits: this.todayData
        }));
        localStorage.setItem('habits_streaks', JSON.stringify(this.streakData));
    },
    
    addHabit() {
        const name = prompt('Название привычки:');
        if (!name || !name.trim()) return;
        
        const habit = {
            id: Date.now(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            icon: this.getRandomIcon()
        };
        
        this.habits.push(habit);
        this.saveData();
        this.render();
    },
    
    toggleHabit(habitId) {
        const today = this.getTodayDate();
        
        if (!this.todayData[habitId]) {
            this.todayData[habitId] = true;
            this.updateStreak(habitId, true);
        } else {
            this.todayData[habitId] = false;
            this.updateStreak(habitId, false);
        }
        
        this.saveData();
        this.render();
        this.updateStreaks();
    },
    
    updateStreak(habitId, completed) {
        if (!this.streakData[habitId]) {
            this.streakData[habitId] = {
                current: 0,
                best: 0,
                lastDate: null
            };
        }
        
        const streak = this.streakData[habitId];
        const today = this.getTodayDate();
        const yesterday = this.getYesterday();
        
        if (completed) {
            if (streak.lastDate === yesterday || streak.current === 0) {
                streak.current++;
                streak.lastDate = today;
            } else if (streak.lastDate !== today) {
                streak.current = 1;
                streak.lastDate = today;
            }
            
            if (streak.current > streak.best) {
                streak.best = streak.current;
            }
        } else {
            if (streak.lastDate === today) {
                streak.current = 0;
                streak.lastDate = null;
            }
        }
    },
    
    deleteHabit(habitId) {
        if (confirm('Удалить эту привычку?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            delete this.todayData[habitId];
            delete this.streakData[habitId];
            this.saveData();
            this.render();
            this.updateStreaks();
        }
    },
    
    render() {
        if (!this.elements.list) return;
        
        this.elements.list.innerHTML = '';
        
        if (this.habits.length === 0) {
            this.elements.list.innerHTML = `
                <div class="habits-empty">
                    <p>Нет привычек. Добавьте первую!</p>
                </div>
            `;
            return;
        }
        
        this.habits.forEach(habit => {
            const item = document.createElement('div');
            item.className = 'habit-item';
            
            const isChecked = this.todayData[habit.id] || false;
            const streak = this.streakData[habit.id] || { current: 0 };
            
            item.innerHTML = `
                <div class="habit-checkbox ${isChecked ? 'checked' : ''}" data-id="${habit.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <span class="habit-name">${habit.name}</span>
                ${streak.current > 0 ? `<span class="habit-streak">🔥 ${streak.current}</span>` : ''}
            `;
            
            const checkbox = item.querySelector('.habit-checkbox');
            checkbox.addEventListener('click', () => this.toggleHabit(habit.id));
            
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.deleteHabit(habit.id);
            });
            
            this.elements.list.appendChild(item);
        });
    },
    
    updateStreaks() {
        let currentMax = 0;
        let bestMax = 0;
        
        Object.values(this.streakData).forEach(streak => {
            if (streak.current > currentMax) {
                currentMax = streak.current;
            }
            if (streak.best > bestMax) {
                bestMax = streak.best;
            }
        });
        
        if (this.elements.currentStreak) {
            this.elements.currentStreak.textContent = currentMax;
        }
        if (this.elements.bestStreak) {
            this.elements.bestStreak.textContent = bestMax;
        }
    },
    
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },
    
    getYesterday() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    },
    
    getRandomIcon() {
        const icons = ['💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '🌱'];
        return icons[Math.floor(Math.random() * icons.length)];
    }
};

window.HabitsModule = HabitsModule; 