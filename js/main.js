// Главный модуль приложения
document.addEventListener('DOMContentLoaded', () => {
    try {
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
        });
        
        // Если страница уже загружена
        if (document.readyState === 'complete') {
            document.body.classList.add('loaded');
        }
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});