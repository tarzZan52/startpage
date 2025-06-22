// Date and time module
const DateTime = {
    timeElement: null,
    dateElement: null,
    intervalId: null,
    
    init() {
        this.timeElement = document.getElementById('time');
        this.dateElement = document.getElementById('date');
        
        if (!this.timeElement || !this.dateElement) {
            console.error('DateTime elements not found');
            return;
        }
        
        this.updateTime();
        
        // Save interval ID for possible cleanup
        this.intervalId = setInterval(() => this.updateTime(), 1000);
    },
    
    updateTime() {
        const now = new Date();
        
        this.timeElement.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        });
        
        this.dateElement.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    },
    
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
};