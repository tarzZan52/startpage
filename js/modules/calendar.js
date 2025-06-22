// Модуль календаря
const CalendarModule = {
    currentDate: new Date(),
    events: {},
    
    elements: {
        days: null,
        currentMonth: null,
        prevBtn: null,
        nextBtn: null
    },
    
    monthNames: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    
    init() {
        this.loadElements();
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    },
    
    loadElements() {
        this.elements.days = document.getElementById('calendarDays');
        this.elements.currentMonth = document.getElementById('calCurrentMonth');
        this.elements.prevBtn = document.getElementById('calPrevMonth');
        this.elements.nextBtn = document.getElementById('calNextMonth');
    },
    
    setupEventListeners() {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prevMonth());
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextMonth());
        }
        
        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => {
            if (!Dashboard.isActive) return;
            
            if (e.key === 'ArrowLeft') {
                this.prevMonth();
            } else if (e.key === 'ArrowRight') {
                this.nextMonth();
            }
        });
    },
    
    loadEvents() {
        const saved = localStorage.getItem('calendar_events');
        if (saved) {
            this.events = JSON.parse(saved);
        }
    },
    
    saveEvents() {
        localStorage.setItem('calendar_events', JSON.stringify(this.events));
    },
    
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },
    
    render() {
        if (!this.elements.days || !this.elements.currentMonth) return;
        
        // Обновляем заголовок
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        this.elements.currentMonth.textContent = `${this.monthNames[month]} ${year}`;
        
        // Очищаем дни
        this.elements.days.innerHTML = '';
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // День недели первого дня (0 - воскресенье, нужно сдвинуть для понедельника)
        let startingDayOfWeek = firstDay.getDay() - 1;
        if (startingDayOfWeek === -1) startingDayOfWeek = 6;
        
        // Сегодняшняя дата
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();
        
        // Добавляем дни предыдущего месяца
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            this.createDayElement(day, true, false);
        }
        
        // Добавляем дни текущего месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const isToday = isCurrentMonth && day === todayDate;
            this.createDayElement(day, false, isToday);
        }
        
        // Добавляем дни следующего месяца
        const remainingDays = 42 - (startingDayOfWeek + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            this.createDayElement(day, true, false);
        }
    },
    
    createDayElement(day, isOtherMonth, isToday) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }
        
        if (isToday) {
            dayEl.classList.add('today');
        }
        
        // Проверяем события
        const dateKey = this.getDateKey(day, isOtherMonth);
        if (this.events[dateKey]) {
            dayEl.classList.add('has-events');
        }
        
        dayEl.textContent = day;
        
        if (!isOtherMonth) {
            dayEl.addEventListener('click', () => this.toggleEvent(day));
        }
        
        this.elements.days.appendChild(dayEl);
    },
    
    getDateKey(day, isOtherMonth = false) {
        const date = new Date(this.currentDate);
        
        if (isOtherMonth) {
            // Для простоты не обрабатываем события других месяцев
            return null;
        }
        
        date.setDate(day);
        return date.toISOString().split('T')[0];
    },
    
    toggleEvent(day) {
        const dateKey = this.getDateKey(day);
        
        if (this.events[dateKey]) {
            delete this.events[dateKey];
        } else {
            const event = prompt('Добавить событие:');
            if (event && event.trim()) {
                this.events[dateKey] = event.trim();
            }
        }
        
        this.saveEvents();
        this.render();
    }
};

window.CalendarModule = CalendarModule; 