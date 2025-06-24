// Модуль для работы с локальным хранилищем
const Storage = {
    KEYS: {
        CUSTOM_APPS: 'dashboard_custom_apps',
        MODIFIED_APPS: 'dashboard_modified_apps',
        HIDDEN_APPS: 'dashboard_hidden_apps'
    },
    
    // Получить все приложения (стандартные + пользовательские)
    getApps() {
        const defaultApps = CONFIG.apps;
        const customApps = this.getCustomApps();
        const modifiedApps = this.getModifiedApps();
        const hiddenApps = this.getHiddenApps();
        
        // Объединяем стандартные приложения с изменениями, исключая скрытые
        const mergedApps = defaultApps
            .filter(app => !hiddenApps.includes(app.id))
            .map(app => {
                const modified = modifiedApps[app.id];
                const baseApp = { ...app, isCustom: false };
                return modified ? { ...baseApp, ...modified, id: app.id, isCustom: false } : baseApp;
            });
        
        return [...mergedApps, ...customApps];
    },
    
    // Получить только пользовательские приложения
    getCustomApps() {
        try {
            const stored = localStorage.getItem(this.KEYS.CUSTOM_APPS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading custom apps:', error);
            return [];
        }
    },
    
    // Получить изменения для стандартных приложений
    getModifiedApps() {
        try {
            const stored = localStorage.getItem(this.KEYS.MODIFIED_APPS);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading modified apps:', error);
            return {};
        }
    },
    
    // Получить список скрытых приложений
    getHiddenApps() {
        try {
            const stored = localStorage.getItem(this.KEYS.HIDDEN_APPS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading hidden apps:', error);
            return [];
        }
    },
    
    // Сохранить пользовательское приложение
    saveApp(app) {
        const customApps = this.getCustomApps();
        customApps.push(app);
        this.saveCustomApps(customApps);
        return app;
    },
    
    // Удалить приложение
    deleteApp(appId) {
        // Проверяем, является ли это пользовательским приложением
        const customApps = this.getCustomApps();
        const customIndex = customApps.findIndex(app => app.id === appId);
        
        if (customIndex !== -1) {
            // Удаляем пользовательское приложение
            const filtered = customApps.filter(app => app.id !== appId);
            this.saveCustomApps(filtered);
        } else {
            // Скрываем стандартное приложение
            const hiddenApps = this.getHiddenApps();
            if (!hiddenApps.includes(appId)) {
                hiddenApps.push(appId);
                this.saveHiddenApps(hiddenApps);
            }
        }
        
        return true;
    },
    
    // Обновить приложение
    updateApp(appId, updates) {
        // Проверяем, является ли это пользовательским приложением
        const customApps = this.getCustomApps();
        const customIndex = customApps.findIndex(app => app.id === appId);
        
        if (customIndex !== -1) {
            // Обновляем пользовательское приложение
            customApps[customIndex] = { 
                ...customApps[customIndex], 
                ...updates,
                id: customApps[customIndex].id,
                isCustom: true
            };
            this.saveCustomApps(customApps);
            return customApps[customIndex];
        }
        
        // If this is a standard application, save changes separately
        const modifiedApps = this.getModifiedApps();
        modifiedApps[appId] = updates;
        this.saveModifiedApps(modifiedApps);
        
        return { id: appId, ...updates };
    },
    
    // Сохранить массив пользовательских приложений
    saveCustomApps(apps) {
        try {
            localStorage.setItem(this.KEYS.CUSTOM_APPS, JSON.stringify(apps));
        } catch (error) {
            console.error('Error saving custom apps:', error);
            alert('Ошибка при сохранении. Возможно, превышен лимит хранилища.');
        }
    },
    
    // Сохранить изменения для стандартных приложений
    saveModifiedApps(modifications) {
        try {
            localStorage.setItem(this.KEYS.MODIFIED_APPS, JSON.stringify(modifications));
        } catch (error) {
            console.error('Error saving modified apps:', error);
        }
    },
    
    // Сохранить список скрытых приложений
    saveHiddenApps(hiddenApps) {
        try {
            localStorage.setItem(this.KEYS.HIDDEN_APPS, JSON.stringify(hiddenApps));
        } catch (error) {
            console.error('Error saving hidden apps:', error);
        }
    },
    
    // Восстановить скрытое стандартное приложение
    restoreApp(appId) {
        const hiddenApps = this.getHiddenApps();
        const filtered = hiddenApps.filter(id => id !== appId);
        this.saveHiddenApps(filtered);
        return true;
    },
    
    // Получить все скрытые стандартные приложения (для возможного отображения в настройках)
    getHiddenDefaultApps() {
        const hiddenIds = this.getHiddenApps();
        return CONFIG.apps.filter(app => hiddenIds.includes(app.id));
    },
    
    // Конвертировать файл в base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};