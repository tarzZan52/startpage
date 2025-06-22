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
        const autoFaviconBtn = document.getElementById('autoFaviconBtn');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleIconUpload(e));
        }
        
        // Кнопка автоматического получения фавиконки
        if (autoFaviconBtn) {
            autoFaviconBtn.addEventListener('click', () => this.loadAutoFavicon());
        }
        
        // Кнопка удаления
        const deleteBtn = document.getElementById('deleteAppBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteApp());
        }
        
        // Автоматическое получение фавиконки при изменении URL
        const urlInput = document.getElementById('appUrl');
        if (urlInput) {
            let urlTimeout;
            urlInput.addEventListener('input', (e) => {
                clearTimeout(urlTimeout);
                urlTimeout = setTimeout(() => {
                    this.tryLoadFavicon(e.target.value);
                }, 1000); // Задержка в 1 секунду после окончания ввода
            });
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
        
        // Устанавливаем фокус на поле названия после открытия модального окна
        setTimeout(() => {
            const nameField = document.getElementById('appName');
            if (nameField) {
                nameField.focus();
            }
        }, 100);
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
        
        // Сбрасываем текст кнопки
        const uploadBtn = document.getElementById('uploadIconBtn');
        if (uploadBtn) {
            uploadBtn.textContent = 'Выбрать файл';
        }
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
            
            // Обновляем текст кнопки
            const uploadBtn = document.getElementById('uploadIconBtn');
            if (uploadBtn) {
                uploadBtn.textContent = 'Иконка загружена ✓';
                setTimeout(() => {
                    uploadBtn.textContent = 'Изменить иконку';
                }, 2000);
            }
            
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
    },
    
    tryLoadFavicon(url, force = false) {
        // Проверяем, что URL валидный и иконка еще не была установлена пользователем (если не принудительно)
        if (!url.trim() || (!force && this.currentIcon)) return;
        
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Пробуем разные варианты получения фавиконки
            const faviconSources = [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `${urlObj.origin}/favicon.ico`
            ];
            
            this.loadFaviconFromSources(faviconSources, 0);
        } catch (error) {
            console.log('Invalid URL for favicon detection:', url);
            if (force) {
                alert('Не удалось загрузить фавиконку. Проверьте URL.');
            }
        }
    },
    
    loadFaviconFromSources(sources, index) {
        if (index >= sources.length) {
            // Все источники попробованы, сообщаем об этом пользователю
            const autoFaviconBtn = document.getElementById('autoFaviconBtn');
            if (autoFaviconBtn && autoFaviconBtn.textContent.includes('Загружаем')) {
                autoFaviconBtn.textContent = 'Фавиконка не найдена';
                autoFaviconBtn.disabled = false;
                setTimeout(() => {
                    autoFaviconBtn.textContent = 'Получить автоматически';
                }, 3000);
            }
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            // Успешно загрузили фавиконку
            const preview = document.getElementById('iconPreview');
            const faviconUrl = sources[index];
            
            preview.innerHTML = `<img src="${faviconUrl}" alt="Favicon">`;
            this.currentIcon = faviconUrl;
            
            // Обновляем кнопки для обратной связи
            const autoFaviconBtn = document.getElementById('autoFaviconBtn');
            const uploadBtn = document.getElementById('uploadIconBtn');
            
            if (autoFaviconBtn) {
                autoFaviconBtn.textContent = 'Фавиконка загружена ✓';
                autoFaviconBtn.disabled = false;
                setTimeout(() => {
                    autoFaviconBtn.textContent = 'Получить автоматически';
                }, 3000);
            }
            
            if (uploadBtn) {
                uploadBtn.textContent = 'Изменить иконку';
                setTimeout(() => {
                    uploadBtn.textContent = 'Выбрать файл';
                }, 3000);
            }
        };
        
        img.onerror = () => {
            // Этот источник не сработал, пробуем следующий
            this.loadFaviconFromSources(sources, index + 1);
        };
        
        img.src = sources[index];
    },
    
    loadAutoFavicon() {
        const urlInput = document.getElementById('appUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Сначала введите URL приложения');
            urlInput.focus();
            return;
        }
        
        // Показываем индикатор загрузки
        const autoFaviconBtn = document.getElementById('autoFaviconBtn');
        const originalText = autoFaviconBtn.textContent;
        autoFaviconBtn.textContent = 'Загружаем...';
        autoFaviconBtn.disabled = true;
        
        // Сбрасываем текущую иконку
        this.currentIcon = null;
        
        // Используем существующую логику получения фавиконки с принудительной загрузкой
        this.tryLoadFavicon(url, true);
        
        // Восстанавливаем кнопку через 3 секунды
        setTimeout(() => {
            autoFaviconBtn.textContent = originalText;
            autoFaviconBtn.disabled = false;
        }, 3000);
    },
    
    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';
        }
    }
};