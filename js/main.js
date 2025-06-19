// Главный модуль приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация всех модулей
    DateTime.init();
    Particles.init();
    Parallax.init();
    Search.init();
    Apps.init();
    
    console.log('Dashboard initialized successfully');
});