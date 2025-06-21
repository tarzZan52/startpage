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
        
        // Глобальный обработчик клавиш для фокуса на поиске
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
        
        // Предотвращаем потерю фокуса при клике по пустому пространству
        document.addEventListener('click', (e) => {
            // Если клик не по модальному окну или элементам управления
            if (!e.target.closest('.modal-overlay') && 
                !e.target.closest('.apps-container') && 
                !e.target.closest('.add-app-btn')) {
                setTimeout(() => this.searchBox.focus(), 10);
            }
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
        // Агрессивная стратегия установки фокуса
        const setFocus = () => {
            if (this.searchBox && document.body) {
                try {
                    // Убираем фокус с любого другого элемента
                    if (document.activeElement && document.activeElement !== this.searchBox) {
                        document.activeElement.blur();
                    }
                    
                    // Устанавливаем фокус
                    this.searchBox.focus();
                    this.searchBox.select(); // Выделяем весь текст
                    
                    // Перемещаем курсор в конец
                    const length = this.searchBox.value.length;
                    this.searchBox.setSelectionRange(length, length);
                    
                    // Принудительно активируем поле
                    this.searchBox.click();
                } catch (e) {
                    console.log('Focus attempt failed:', e);
                }
            }
        };
        
        // Используем requestAnimationFrame для лучшего тайминга
        const rafSetFocus = () => {
            requestAnimationFrame(() => {
                setFocus();
                // Дополнительная попытка в следующем кадре
                requestAnimationFrame(setFocus);
            });
        };
        
        // Множественные стратегии установки фокуса
        rafSetFocus();
        setTimeout(rafSetFocus, 0);
        setTimeout(rafSetFocus, 1);
        setTimeout(rafSetFocus, 10);
        setTimeout(rafSetFocus, 50);
        setTimeout(rafSetFocus, 100);
        setTimeout(rafSetFocus, 200);
        setTimeout(rafSetFocus, 500);
        setTimeout(rafSetFocus, 1000);
        
        // Обработчики событий
        window.addEventListener('focus', rafSetFocus);
        window.addEventListener('pageshow', rafSetFocus);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                rafSetFocus();
            }
        });
        
        // Глобальный обработчик для перехвата фокуса
        const interceptFocus = () => {
            if (document.activeElement !== this.searchBox && 
                !document.querySelector('.modal-overlay[style*="flex"]')) {
                rafSetFocus();
            }
        };
        
        // Перехватываем различные события
        document.addEventListener('click', interceptFocus);
        document.addEventListener('keydown', interceptFocus);
        document.addEventListener('mousedown', interceptFocus);
        window.addEventListener('load', rafSetFocus);
        
        // Постоянный мониторинг фокуса
        setInterval(() => {
            if (document.activeElement !== this.searchBox && 
                !document.querySelector('.modal-overlay[style*="flex"]')) {
                rafSetFocus();
            }
        }, 1000);
    },
    
    handleGlobalKeydown(e) {
        // Игнорируем если открыт модальный редактор
        if (document.getElementById('editorModal').style.display === 'flex') {
            return;
        }
        
        // Игнорируем служебные клавиши
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        
        // Игнорируем функциональные клавиши
        if (e.key.startsWith('F') || 
            ['Tab', 'Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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