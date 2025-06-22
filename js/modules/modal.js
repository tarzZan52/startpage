// Переиспользуемый модуль для модальных окон
const Modal = {
    currentModal: null,
    templateClone: null,
    
    /**
     * Открыть модальное окно
     * @param {string} title - заголовок модального окна
     * @param {string|HTMLElement} content - содержимое модального окна
     * @param {object} options - дополнительные опции
     */
    open(title, content, options = {}) {
        // Закрываем текущее модальное окно если оно есть
        if (this.currentModal) {
            this.close();
        }
        
        // Получаем шаблон или создаем его
        const template = this.getTemplate();
        this.templateClone = template.content.cloneNode(true);
        
        // Находим элементы в клоне
        const modal = this.templateClone.querySelector('.universal-modal');
        const titleElement = this.templateClone.querySelector('.universal-modal-title');
        const contentElement = this.templateClone.querySelector('.universal-modal-body');
        const closeBtn = this.templateClone.querySelector('.universal-modal-close');
        
        // Устанавливаем заголовок
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        // Устанавливаем содержимое
        if (contentElement) {
            if (typeof content === 'string') {
                contentElement.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentElement.appendChild(content);
            }
        }
        
        // Применяем дополнительные опции
        if (options.className) {
            modal.classList.add(options.className);
        }
        
        // Добавляем обработчики
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Закрытие по клику на оверлей
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
        
        // Закрытие по ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Добавляем в DOM
        document.body.appendChild(this.templateClone);
        this.currentModal = modal;
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Вызываем callback если есть
        if (options.onOpen) {
            options.onOpen(modal);
        }
        
        return modal;
    },
    
    /**
     * Закрыть текущее модальное окно
     */
    close() {
        if (!this.currentModal) {
            return;
        }
        
        this.currentModal.classList.remove('active');
        
        setTimeout(() => {
            if (this.currentModal && this.currentModal.parentNode) {
                this.currentModal.parentNode.removeChild(this.currentModal);
            }
            this.currentModal = null;
            this.templateClone = null;
        }, 300);
    },
    
    /**
     * Получить или создать шаблон модального окна
     */
    getTemplate() {
        let template = document.getElementById('universal-modal-template');
        
        if (!template) {
            // Создаем шаблон если его нет
            template = document.createElement('template');
            template.id = 'universal-modal-template';
            template.innerHTML = `
                <div class="universal-modal">
                    <div class="universal-modal-content">
                        <div class="universal-modal-header">
                            <h2 class="universal-modal-title"></h2>
                            <button class="universal-modal-close" type="button">✕</button>
                        </div>
                        <div class="universal-modal-body"></div>
                    </div>
                </div>
            `;
            document.head.appendChild(template);
        }
        
        return template;
    },
    
    /**
     * Показать простое подтверждение
     * @param {string} message - сообщение
     * @param {function} onConfirm - callback при подтверждении
     * @param {function} onCancel - callback при отмене
     */
    confirm(message, onConfirm, onCancel = null) {
        const content = document.createElement('div');
        content.className = 'modal-confirm-content';
        content.innerHTML = `
            <p class="modal-confirm-message">${message}</p>
            <div class="modal-confirm-actions">
                <button class="btn-secondary modal-cancel-btn" type="button">Cancel</button>
                <button class="btn-primary modal-confirm-btn" type="button">OK</button>
            </div>
        `;
        
        const modal = this.open('Confirm', content, {
            className: 'modal-confirm'
        });
        
        // Обработчики для кнопок
        const confirmBtn = content.querySelector('.modal-confirm-btn');
        const cancelBtn = content.querySelector('.modal-cancel-btn');
        
        confirmBtn.addEventListener('click', () => {
            this.close();
            if (onConfirm) onConfirm();
        });
        
        cancelBtn.addEventListener('click', () => {
            this.close();
            if (onCancel) onCancel();
        });
        
        // Фокус на кнопку подтверждения
        setTimeout(() => {
            confirmBtn.focus();
        }, 100);
        
        return modal;
    }
};

// Экспорт модуля
window.Modal = Modal; 