// Модуль управления дашбордом
const Dashboard = {
    isActive: false,
    mainContent: null,
    dashboardContent: null,
    toggleBtn: null,
    
    init() {
        this.mainContent = document.getElementById('mainContent');
        this.dashboardContent = document.getElementById('dashboardContent');
        this.toggleBtn = document.getElementById('modeToggleBtn');
        
        if (!this.mainContent || !this.dashboardContent || !this.toggleBtn) {
            console.error('Dashboard elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.loadState();
    },
    
    setupEventListeners() {
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            // Игнорируем если открыто модальное окно или фокус в поле ввода
            if (document.querySelector('.modal-overlay.active') || 
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }
            
            // Ctrl/Cmd + D для переключения дашборда
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggle();
            }
        });
    },
    
    toggle() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.showDashboard();
        } else {
            this.showMain();
        }
        
        this.saveState();
    },
    
    showDashboard() {
        this.isActive = true;
        
        // Сначала полностью скрываем главную страницу с анимацией
        this.mainContent.style.opacity = '0';
        this.mainContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            // Активируем режим дашборда
            document.body.classList.add('dashboard-mode');
            
            // Показываем дашборд
            this.dashboardContent.style.display = 'block';
            
            setTimeout(() => {
                this.dashboardContent.classList.add('active');
            }, 50);
        }, 200);
        
        // Инициализируем виджеты при первом показе
        if (!this.dashboardContent.dataset.initialized) {
            this.initializeWidgets();
            this.dashboardContent.dataset.initialized = 'true';
        }
        
        // Обновляем данные виджетов
        this.refreshWidgets();
    },
    
    showMain() {
        this.isActive = false;
        
        // Сначала скрываем дашборд с анимацией
        this.dashboardContent.classList.remove('active');
        
        setTimeout(() => {
            this.dashboardContent.style.display = 'none';
            
            // Убираем режим дашборда
            document.body.classList.remove('dashboard-mode');
            
            // Сбрасываем все inline стили главной страницы
            this.mainContent.removeAttribute('style');
            
            setTimeout(() => {
                // Принудительно перезапускаем стили главной страницы
                this.mainContent.style.opacity = '0';
                this.mainContent.style.transform = 'translateY(20px)';
                
                // Анимируем появление
                requestAnimationFrame(() => {
                    this.mainContent.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    this.mainContent.style.opacity = '1';
                    this.mainContent.style.transform = 'translateY(0)';
                });
            }, 50);
        }, 200);
    },
    
    initializeWidgets() {
        // Инициализируем все виджеты
        if (typeof PomodoroModule !== 'undefined') {
            PomodoroModule.init();
        }
        
        if (typeof CryptoModule !== 'undefined') {
            CryptoModule.init();
        }
        
        if (typeof CalendarModule !== 'undefined') {
            CalendarModule.init();
        }
        
        if (typeof TodoModule !== 'undefined') {
            TodoModule.init();
        }
    },
    
    refreshWidgets() {
        // Обновляем данные виджетов
        if (typeof CryptoModule !== 'undefined' && this.isActive) {
            CryptoModule.refresh();
        }
        
        if (typeof CalendarModule !== 'undefined' && this.isActive) {
            CalendarModule.refresh();
        }
    },
    
    saveState() {
        localStorage.setItem('dashboard_active', this.isActive.toString());
    },
    
    loadState() {
        const savedState = localStorage.getItem('dashboard_active');
        if (savedState === 'true') {
            this.showDashboard();
        } else {
            // Убеждаемся что мы в правильном состоянии
            this.ensureMainState();
        }
    },
    
    ensureMainState() {
        // Принудительно сбрасываем состояние к главной странице
        document.body.classList.remove('dashboard-mode');
        this.dashboardContent.style.display = 'none';
        this.dashboardContent.classList.remove('active');
        this.mainContent.removeAttribute('style');
        this.isActive = false;
    }
}; 