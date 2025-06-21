// Модуль для управления приложениями
const Apps = {
    container: null,
    
    init() {
        this.container = document.getElementById('appsContainer');
        if (!this.container) {
            console.error('Apps container not found');
            return;
        }
        
        this.loadApps();
    },
    
    loadApps() {
        // Очищаем контейнер
        this.container.innerHTML = '';
        
        // Загружаем приложения из Storage
        const apps = Storage.getApps();
        
        // Ограничиваем количество до 12
        const appsToShow = apps.slice(0, 12);
        
        // Рендерим приложения
        appsToShow.forEach(app => {
            const tile = this.createAppTile(app);
            this.container.appendChild(tile);
        });
        
        // Анимируем плитки
        this.animateTiles();
        
        // Обновляем видимость кнопки добавления
        this.updateAddButton(apps.length);
    },
    
    createAppTile(app) {
        const tile = document.createElement('a');
        tile.href = app.url;
        tile.className = 'app-tile';
        tile.target = '_blank';
        tile.dataset.appId = app.id;
        
        // Предотвращаем переход по ссылке при клике на кнопку редактирования
        tile.addEventListener('click', (e) => {
            if (e.target.closest('.app-edit-btn')) {
                e.preventDefault();
            }
        });
        
        // Иконка
        const icon = document.createElement('div');
        icon.className = 'app-icon';
        
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        img.onerror = () => {
            // Если изображение не загрузилось, показываем дефолтную иконку
            img.src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';
        };
        
        // Название
        const name = document.createElement('span');
        name.className = 'app-name';
        name.textContent = app.name;
        name.title = app.name; // Тултип для длинных названий
        
        // Кнопка редактирования для всех приложений
        const editBtn = document.createElement('button');
        editBtn.className = 'app-edit-btn';
        editBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        `;
        editBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            Editor.openEditor(app.id);
        };
        
        icon.appendChild(img);
        tile.appendChild(icon);
        tile.appendChild(name);
        tile.appendChild(editBtn);
        
        return tile;
    },
    
    animateTiles() {
        const tiles = this.container.querySelectorAll('.app-tile');
        tiles.forEach((tile, index) => {
            // Устанавливаем начальное состояние для анимации
            tile.style.opacity = '1';
            tile.style.animationDelay = `${0.1 * index}s`;
            tile.style.animation = 'tileSlideUp 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards';
        });
    },
    
    updateAddButton(appsCount) {
        const addBtn = document.getElementById('addAppBtn');
        if (addBtn) {
            // Показываем кнопку только если меньше 12 приложений
            addBtn.style.display = appsCount < 12 ? 'flex' : 'none';
        }
    }
};