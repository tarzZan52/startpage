// Главный модуль приложения

// Немедленная попытка установки фокуса
const immediatelyFocusSearch = () => {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        // Проверяем, активно ли окно (важно для новых вкладок)
        if (!document.hasFocus()) {
            // Если окно не в фокусе, ждем его активации
            const waitForFocus = () => {
                if (document.hasFocus()) {
                    searchBox.focus();
                    searchBox.select();
                } else {
                    setTimeout(waitForFocus, 50);
                }
            };
            waitForFocus();
        } else {
            searchBox.focus();
            searchBox.select();
        }
        return true;
    }
    return false;
};

// Специальная обработка для новых вкладок
const handleNewTab = () => {
    // Ждем, пока окно станет активным
    const checkWindowFocus = () => {
        if (document.hasFocus()) {
            immediatelyFocusSearch();
        } else {
            setTimeout(checkWindowFocus, 10);
        }
    };
    checkWindowFocus();
};

// Пытаемся установить фокус как можно раньше
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleNewTab);
} else {
    handleNewTab();
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Принудительное перехватывание фокуса
        const preventAddressBarFocus = () => {
            const searchBox = document.getElementById('searchBox');
            if (searchBox && document.activeElement !== searchBox && document.hasFocus()) {
                searchBox.focus();
            }
        };
        
        // Специальная обработка для переключения вкладок
        const handleTabSwitch = () => {
            if (!document.hidden && document.hasFocus()) {
                setTimeout(() => {
                    const searchBox = document.getElementById('searchBox');
                    if (searchBox) {
                        searchBox.focus();
                        searchBox.select();
                    }
                }, 100);
            }
        };
        
        // Перехватываем различные события
        window.addEventListener('beforeunload', preventAddressBarFocus);
        window.addEventListener('focus', preventAddressBarFocus);
        document.addEventListener('visibilitychange', handleTabSwitch);
        document.addEventListener('focusin', (e) => {
            if (e.target === document.body || e.target === document.documentElement) {
                preventAddressBarFocus();
            }
        });
        
        // Инициализация всех модулей
        DateTime.init();
        Particles.init();
        Search.init();
        Apps.init();
        Editor.init();
        
        console.log('Dashboard initialized successfully');
        
        // Останавливаем индикатор загрузки
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            console.log('Page fully loaded');
            
            // Принудительно устанавливаем фокус на поле поиска
            const forceFocus = () => {
                const searchBox = document.getElementById('searchBox');
                if (searchBox) {
                    searchBox.focus();
                    searchBox.click(); // Дополнительный клик для активации
                }
            };
            
            // Множественные попытки установки фокуса
            setTimeout(forceFocus, 100);
            setTimeout(forceFocus, 300);
            setTimeout(forceFocus, 500);
            setTimeout(forceFocus, 1000);
        });
        
        // Если страница уже загружена
        if (document.readyState === 'complete') {
            document.body.classList.add('loaded');
            const forceFocus = () => {
                const searchBox = document.getElementById('searchBox');
                if (searchBox) {
                    searchBox.focus();
                    searchBox.click();
                }
            };
            setTimeout(forceFocus, 100);
            setTimeout(forceFocus, 300);
        }
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});