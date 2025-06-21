// Модуль календаря
const CalendarModule = {
    currentDate: new Date(),
    calendarGrid: null,
    monthLabel: null,
    prevBtn: null,
    nextBtn: null,
    
    monthNames: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    
    dayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    
    init() {
        this.calendarGrid = document.getElementById('calendarGrid');
        this.monthLabel = document.getElementById('calendarMonth');
        this.prevBtn = document.getElementById('calendarPrev');
        this.nextBtn = document.getElementById('calendarNext');
        
        if (!this.calendarGrid || !this.monthLabel || !this.prevBtn || !this.nextBtn) {
            console.error('Calendar elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.refresh();
    },
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.refresh();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.refresh();
        });
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.modal-overlay.active') || 
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
                !Dashboard.isActive) {
                return;
            }
            
            if (e.key === 'ArrowLeft' && e.ctrlKey) {
                e.preventDefault();
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.refresh();
            } else if (e.key === 'ArrowRight' && e.ctrlKey) {
                e.preventDefault();
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.refresh();
            }
        });
    },
    
    refresh() {
        this.updateMonthLabel();
        this.generateCalendar();
    },
    
    updateMonthLabel() {
        const month = this.monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        this.monthLabel.textContent = `${month} ${year}`;
    },
    
    generateCalendar() {
        this.calendarGrid.innerHTML = '';
        
        // Добавляем заголовки дней недели
        this.dayNames.forEach(dayName => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day header';
            dayHeader.textContent = dayName;
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // Получаем данные для текущего месяца
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        // Последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        
        // Начинаем с понедельника (getDay() возвращает 0 для воскресенья)
        const startDate = new Date(firstDay);
        const dayOfWeek = (firstDay.getDay() + 6) % 7; // Преобразуем в формат Пн=0...Вс=6
        startDate.setDate(startDate.getDate() - dayOfWeek);
        
        // Генерируем 6 недель (42 дня)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDay.getDate();
            
            // Отмечаем дни не текущего месяца
            if (currentDay.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // Отмечаем сегодняшний день
            if (currentDay.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Добавляем обработчик клика
            dayElement.addEventListener('click', () => {
                if (!dayElement.classList.contains('other-month')) {
                    this.selectDate(currentDay);
                }
            });
            
            this.calendarGrid.appendChild(dayElement);
        }
    },
    
    selectDate(date) {
        // Убираем предыдущий выбор
        const selectedDay = this.calendarGrid.querySelector('.calendar-day.selected');
        if (selectedDay) {
            selectedDay.classList.remove('selected');
        }
        
        // Находим и выделяем новый день
        const dayElements = this.calendarGrid.querySelectorAll('.calendar-day:not(.header):not(.other-month)');
        dayElements.forEach(el => {
            if (parseInt(el.textContent) === date.getDate()) {
                el.classList.add('selected');
            }
        });
        
        console.log('Selected date:', date.toLocaleDateString('ru-RU'));
    }
};

// Экспорт модуля
window.CalendarModule = CalendarModule; 