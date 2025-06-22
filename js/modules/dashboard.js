// Dashboard management module
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
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if modal is open or focus is in input field
            if (document.querySelector('.modal-overlay.active') || 
                document.querySelector('.habit-modal.active') ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }
            
            // Ctrl/Cmd + D to toggle dashboard
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
    },
    
    showDashboard() {
        this.isActive = true;
        
        // First completely hide main page with animation
        this.mainContent.style.opacity = '0';
        this.mainContent.style.transform = 'translateY(-20px)';
        
        // Small delay for smooth animation
        requestAnimationFrame(() => {
            // Activate dashboard mode
            document.body.classList.add('dashboard-mode');
            
            // Show dashboard
            this.dashboardContent.style.display = 'block';
            
            requestAnimationFrame(() => {
                this.dashboardContent.classList.add('active');
            });
        });
        
        // Initialize widgets on first show
        if (!this.dashboardContent.dataset.initialized) {
            this.initializeWidgets();
            this.dashboardContent.dataset.initialized = 'true';
        }
        
        // Update widget data
        this.refreshWidgets();
        
        // Notify other modules that dashboard is active
        EventBus.emit('dashboard:activated');
    },
    
    showMain() {
        this.isActive = false;
        

        
        // First hide dashboard with animation
        this.dashboardContent.classList.remove('active');
        
        requestAnimationFrame(() => {
            this.dashboardContent.style.display = 'none';
            
            // Remove dashboard mode
            document.body.classList.remove('dashboard-mode');
            
            // Reset all inline styles of main page
            this.mainContent.removeAttribute('style');
            
            requestAnimationFrame(() => {
                // Force restart main page styles
                this.mainContent.style.opacity = '0';
                this.mainContent.style.transform = 'translateY(20px)';
                
                // Animate appearance
                requestAnimationFrame(() => {
                    this.mainContent.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    this.mainContent.style.opacity = '1';
                    this.mainContent.style.transform = 'translateY(0)';
                });
            });
        });
    },
    
    initializeWidgets() {
        // Initialize all widgets
        if (typeof PomodoroModule !== 'undefined') {
            PomodoroModule.init();
        }
        
        if (typeof HabitsModule !== 'undefined') {
            HabitsModule.init();
        }
        

        
        if (typeof TodoModule !== 'undefined') {
            TodoModule.init();
        }
        
        // Initialize analytics module
        if (typeof AnalyticsModule !== 'undefined') {
            AnalyticsModule.init();
        }
    },
    
    refreshWidgets() {
        // Update widget data
        if (typeof HabitsModule !== 'undefined' && this.isActive) {
            HabitsModule.updateStats();
        }
        

        
        if (typeof AnalyticsModule !== 'undefined' && this.isActive) {
            AnalyticsModule.refreshData();
        }
    },
    
    loadState() {
        // Always start with main page when opening new tab
        this.ensureMainState();
    },
    
    ensureMainState() {
        // Force reset state to main page
        document.body.classList.remove('dashboard-mode');
        this.dashboardContent.style.display = 'none';
        this.dashboardContent.classList.remove('active');
        this.mainContent.removeAttribute('style');
        this.isActive = false;
    }
};