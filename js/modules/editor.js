// Модуль редактора приложений
const Editor = {
    modal: null,
    form: null,
    currentApp: null,
    currentIcon: null,
    
    init() {
        this.modal = document.getElementById('editorModal');
        this.form = document.getElementById('editorForm');
        
        if (!this.modal || !this.form) {
            console.error('Editor elements not found');
            return;
        }
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Кнопка добавления нового приложения
        const addBtn = document.getElementById('addAppBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openEditor());
        }
        
        // Закрытие модального окна
        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEditor());
        }
        
        // Клик по оверлею
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeEditor();
            }
        });
        
        // Отправка формы
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApp();
        });
        
        // Кнопка загрузки иконки
        const uploadBtn = document.getElementById('uploadIconBtn');
        const fileInput = document.getElementById('iconFile');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleIconUpload(e));
        }
        
        // Кнопка удаления
        const deleteBtn = document.getElementById('deleteAppBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteApp());
        }
    },
    
    openEditor(appId = null) {
        this.currentApp = null;
        this.currentIcon = null;
        const deleteBtn = document.getElementById('deleteAppBtn');
        
        if (appId) {
            // Редактирование существующего приложения
            const apps = Storage.getApps();
            this.currentApp = apps.find(app => app.id === appId);
            
            if (this.currentApp) {
                this.populateForm(this.currentApp);
                // Показываем кнопку удаления только для пользовательских приложений
                deleteBtn.style.display = this.currentApp.isCustom ? 'block' : 'none';
            }
        } else {
            // Новое приложение
            this.clearForm();
            deleteBtn.style.display = 'none';
        }
        
        this.modal.classList.add('active');
    },
    
    closeEditor() {
        this.modal.classList.remove('active');
        this.currentApp = null;
        this.currentIcon = null;
        this.clearForm();
    },
    
    populateForm(app) {
        document.getElementById('appName').value = app.name || '';
        document.getElementById('appUrl').value = app.url || '';
        
        const preview = document.getElementById('iconPreview');
        if (app.icon) {
            preview.innerHTML = `<img src="${app.icon}" alt="${app.name}">`;
            // Сохраняем текущую иконку
            this.currentIcon = app.icon;
        }
    },
    
    clearForm() {
        this.form.reset();
        const preview = document.getElementById('iconPreview');
        preview.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        `;
        // Очищаем сохраненную иконку
        this.currentIcon = null;
    },
    
    async handleIconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверяем размер файла (максимум 500KB)
        if (file.size > 500 * 1024) {
            alert('Файл слишком большой. Максимальный размер: 500KB');
            return;
        }
        
        try {
            const base64 = await Storage.fileToBase64(file);
            const preview = document.getElementById('iconPreview');
            preview.innerHTML = `<img src="${base64}" alt="Icon preview">`;
            
            // Сохраняем иконку в переменной
            this.currentIcon = base64;
            
            // Очищаем input для возможности повторной загрузки того же файла
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading icon:', error);
            alert('Ошибка при загрузке иконки. Попробуйте другой файл.');
        }
    },
    
    saveApp() {
        const formData = {
            name: document.getElementById('appName').value.trim(),
            url: document.getElementById('appUrl').value.trim(),
            icon: this.currentIcon || null
        };
        
        if (!formData.name || !formData.url) {
            alert('Пожалуйста, заполните обязательные поля');
            return;
        }
        
        if (this.currentApp) {
            // Обновляем существующее приложение
            Storage.updateApp(this.currentApp.id, formData);
        } else {
            // Проверяем, не достигнут ли лимит в 12 приложений
            const currentApps = Storage.getApps();
            if (currentApps.length >= 12) {
                alert('Достигнут максимум приложений (12). Удалите одно из существующих приложений.');
                return;
            }
            
            // Создаем новое приложение
            const newApp = {
                id: `custom_${Date.now()}`,
                ...formData,
                isCustom: true
            };
            
            // Если иконка не выбрана, используем дефолтную
            if (!newApp.icon) {
                newApp.icon = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';
            }
            
            Storage.saveApp(newApp);
        }
        
        // Перезагружаем приложения
        Apps.loadApps();
        this.closeEditor();
    },
    
    deleteApp() {
        if (!this.currentApp || !this.currentApp.isCustom) return;
        
        if (confirm(`Удалить приложение "${this.currentApp.name}"?`)) {
            Storage.deleteApp(this.currentApp.id);
            Apps.loadApps();
            this.closeEditor();
        }
    }
};