// Модуль для работы с датой и временем
const DateTime = {
    timeElement: null,
    dateElement: null,
    
    init() {
        this.timeElement = document.getElementById('time');
        this.dateElement = document.getElementById('date');
        
        if (!this.timeElement || !this.dateElement) {
            console.error('DateTime elements not found');
            return;
        }
        
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    },
    
    updateTime() {
        const now = new Date();
        
        this.timeElement.textContent = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        this.dateElement.textContent = now.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
};