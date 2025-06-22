// Главный модуль приложения

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting application...');
    
    // Инициализация основных модулей
    try {
        Search.init();
        console.log('✅ Search module initialized');
    } catch (error) {
        console.error('❌ Search module failed:', error);
    }

    try {
        Apps.init();
        console.log('✅ Apps module initialized');
    } catch (error) {
        console.error('❌ Apps module failed:', error);
    }

    try {
        Editor.init();
        console.log('✅ Editor module initialized');
    } catch (error) {
        console.error('❌ Editor module failed:', error);
    }

    try {
        DateTime.init();
        console.log('✅ DateTime module initialized');
    } catch (error) {
        console.error('❌ DateTime module failed:', error);
    }

    try {
        Dashboard.init();
        console.log('✅ Dashboard module initialized');
    } catch (error) {
        console.error('❌ Dashboard module failed:', error);
    }

    try {
        Particles.init();
        console.log('✅ Particles module initialized');
    } catch (error) {
        console.error('❌ Particles module failed:', error);
    }

    try {
        TodoModule.init();
        console.log('✅ Todo module initialized');
    } catch (error) {
        console.error('❌ Todo module failed:', error);
    }

    // Дополнительное логирование для отладки
    setTimeout(() => {
        console.log('🔍 Post-init check:');
        console.log('Dashboard active:', Dashboard?.isActive);
        console.log('Pomodoro initialized:', typeof PomodoroModule !== 'undefined');
        console.log('Habits initialized:', typeof HabitsModule !== 'undefined');
        console.log('Analytics initialized:', typeof AnalyticsModule !== 'undefined');
        console.log('Settings button exists:', !!document.getElementById('pomodoroSettingsBtn'));
        console.log('Settings dropdown exists:', !!document.getElementById('pomodoroSettingsDropdown'));
        console.log('Chart.js loaded:', typeof Chart !== 'undefined');
    }, 1000);
    
    console.log('🎉 Application initialization complete');
});