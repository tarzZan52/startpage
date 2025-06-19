// Модуль для управления приложениями
const Apps = {
    container: null,
    
    init() {
        this.container = document.getElementById('appsContainer');
        if (!this.container) {
            console.error('Apps container not found');
            return;
        }
        
        this.renderApps();
        this.animateTiles();
    },
    
    renderApps() {
        CONFIG.apps.forEach(app => {
            const tile = this.createAppTile(app);
            this.container.appendChild(tile);
        });
    },
    
    createAppTile(app) {
        const tile = document.createElement('a');
        tile.href = app.url;
        tile.className = `app-tile ${app.class}`;
        tile.target = '_blank';
        
        const icon = document.createElement('div');
        icon.className = 'app-icon';
        
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        
        const name = document.createElement('span');
        name.className = 'app-name';
        name.textContent = app.name;
        
        icon.appendChild(img);
        tile.appendChild(icon);
        tile.appendChild(name);
        
        return tile;
    },
    
    animateTiles() {
        const tiles = this.container.querySelectorAll('.app-tile');
        tiles.forEach((tile, index) => {
            tile.style.animationDelay = `${0.1 * index}s`;
            tile.style.animation = 'slideUp 0.6s ease-out forwards';
        });
    }
};