// Модуль для поисковой функциональности
const Search = {
    searchBox: null,
    searchForm: null,
    engineButtons: null,
    searchIcon: null,
    currentEngine: 'duckduckgo',
    
    init() {
        this.searchBox = document.getElementById('searchBox');
        this.searchForm = document.getElementById('searchForm');
        this.engineButtons = document.querySelectorAll('.engine-btn');
        this.searchIcon = document.querySelector('.search-icon');
        
        if (!this.searchBox || !this.searchForm) {
            console.error('Search elements not found');
            return;
        }
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Обработка отправки формы
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
        
        // Клик по иконке поиска
        if (this.searchIcon) {
            this.searchIcon.addEventListener('click', () => this.performSearch());
        }
        
        // Переключение поисковых систем
        this.engineButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setSearchEngine(button.dataset.engine);
            });
        });
    },
    
    setSearchEngine(engine) {
        this.currentEngine = engine;
        
        // Обновляем активную кнопку
        this.engineButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.engine === engine);
        });
        
        // Обновляем placeholder
        this.searchBox.placeholder = CONFIG.searchEngines[engine].placeholder;
        this.searchBox.focus();
    },
    
    performSearch() {
        const query = this.searchBox.value.trim();
        if (query) {
            const searchUrl = CONFIG.searchEngines[this.currentEngine].url;
            window.location.href = searchUrl + encodeURIComponent(query);
        }
    }
};