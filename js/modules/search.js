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
        this.setInitialFocus();
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
        
        // Простой обработчик для фокуса при вводе
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
    },
    
    setSearchEngine(engine) {
        if (!CONFIG.searchEngines[engine]) {
            console.error('Unknown search engine:', engine);
            return;
        }
        
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
    },
    
    setInitialFocus() {
        // Простая установка фокуса при загрузке
        setTimeout(() => {
            if (this.searchBox) {
                this.searchBox.focus();
            }
        }, 100);
    },
    
    handleGlobalKeydown(e) {
        // Игнорируем если открыт модальный редактор
        const modal = document.getElementById('editorModal');
        if (modal && modal.classList.contains('active')) {
            return;
        }
        
        // Игнорируем если фокус в любом поле ввода (input, textarea, select)
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        )) {
            return;
        }
        
        // Игнорируем служебные клавиши
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        
        // Игнорируем функциональные клавиши
        if (e.key.startsWith('F') || 
            ['Tab', 'Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(e.key)) {
            return;
        }
        
        // Если поле поиска не в фокусе и нажата печатная клавиша
        if (document.activeElement !== this.searchBox && 
            e.key.length === 1 && 
            !e.ctrlKey && !e.altKey && !e.metaKey) {
            this.searchBox.focus();
        }
    }
};