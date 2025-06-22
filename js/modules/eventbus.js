// Система событий для слабого связывания модулей
const EventBus = {
    events: new Map(),
    
    /**
     * Подписаться на событие
     * @param {string} eventName - название события
     * @param {function} callback - функция-обработчик
     * @param {object} context - контекст для this (опционально)
     */
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        this.events.get(eventName).push({
            callback,
            context
        });
    },
    
    /**
     * Отписаться от события
     * @param {string} eventName - название события
     * @param {function} callback - функция-обработчик для удаления
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) {
            return;
        }
        
        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(listener => listener.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        // Удаляем пустой массив слушателей
        if (listeners.length === 0) {
            this.events.delete(eventName);
        }
    },
    
    /**
     * Опубликовать событие
     * @param {string} eventName - название события
     * @param {*} data - данные для передачи слушателям
     */
    emit(eventName, data = null) {
        if (!this.events.has(eventName)) {
            return;
        }
        
        const listeners = this.events.get(eventName);
        listeners.forEach(listener => {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }
            } catch (error) {
                console.error(`Error in event listener for "${eventName}":`, error);
            }
        });
    },
    
    /**
     * Подписаться на событие один раз
     * @param {string} eventName - название события
     * @param {function} callback - функция-обработчик
     * @param {object} context - контекст для this (опционально)
     */
    once(eventName, callback, context = null) {
        const onceWrapper = (data) => {
            callback.call(context, data);
            this.off(eventName, onceWrapper);
        };
        
        this.on(eventName, onceWrapper);
    },
    
    /**
     * Очистить все обработчики события
     * @param {string} eventName - название события (опционально, если не указано - очищает все)
     */
    clear(eventName = null) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }
};

// Экспорт модуля
window.EventBus = EventBus; 