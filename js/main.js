// Главный модуль приложения

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация основных модулей
    try {
        Search.init();
    } catch (error) {
        console.error('Search module failed:', error);
    }

    try {
        Apps.init();
    } catch (error) {
        console.error('Apps module failed:', error);
    }

    try {
        Editor.init();
    } catch (error) {
        console.error('Editor module failed:', error);
    }

    try {
        DateTime.init();
    } catch (error) {
        console.error('DateTime module failed:', error);
    }

    try {
        Dashboard.init();
    } catch (error) {
        console.error('Dashboard module failed:', error);
    }

    try {
        Particles.init();
    } catch (error) {
        console.error('Particles module failed:', error);
    }
});