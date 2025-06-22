// Модуль быстрых ссылок
const QuickLinksModule = {
    links: [],
    
    elements: {
        grid: null,
        addBtn: null
    },
    
    defaultLinks: [
        {
            id: 1,
            name: 'GitHub',
            url: 'https://github.com',
            icon: '/icons/icons8-github.svg'
        },
        {
            id: 2,
            name: 'Gmail',
            url: 'https://mail.google.com',
            icon: '/icons/icons8-gmail.svg'
        }
    ],
    
    init() {
        this.loadElements();
        this.loadLinks();
        this.setupEventListeners();
        this.render();
    },
    
    loadElements() {
        this.elements.grid = document.getElementById('quickLinksGrid');
        this.elements.addBtn = document.getElementById('addQuickLinkBtn');
    },
    
    setupEventListeners() {
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.addLink());
        }
    },
    
    loadLinks() {
        const saved = localStorage.getItem('quicklinks_data');
        if (saved) {
            this.links = JSON.parse(saved);
        } else {
            this.links = [...this.defaultLinks];
            this.saveLinks();
        }
    },
    
    saveLinks() {
        localStorage.setItem('quicklinks_data', JSON.stringify(this.links));
    },
    
    addLink() {
        const name = prompt('Название ссылки:');
        if (!name || !name.trim()) return;
        
        const url = prompt('URL (с https://):');
        if (!url || !url.trim()) return;
        
        const link = {
            id: Date.now(),
            name: name.trim(),
            url: url.trim(),
            icon: this.getFaviconUrl(url.trim())
        };
        
        this.links.push(link);
        this.saveLinks();
        this.render();
    },
    
    deleteLink(linkId) {
        if (confirm('Удалить эту ссылку?')) {
            this.links = this.links.filter(l => l.id !== linkId);
            this.saveLinks();
            this.render();
        }
    },
    
    render() {
        if (!this.elements.grid) return;
        
        this.elements.grid.innerHTML = '';
        
        if (this.links.length === 0) {
            this.elements.grid.innerHTML = `
                <div class="quicklinks-empty">
                    <p>Нет ссылок. Добавьте первую!</p>
                </div>
            `;
            return;
        }
        
        this.links.forEach(link => {
            const linkEl = document.createElement('a');
            linkEl.className = 'quicklink-item';
            linkEl.href = link.url;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            
            linkEl.innerHTML = `
                <div class="quicklink-icon">
                    <img src="${link.icon}" alt="${link.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'></circle><path d=\\'M8 14s1.5 2 4 2 4-2 4-2\\'></path><line x1=\\'9\\' y1=\\'9\\' x2=\\'9.01\\' y2=\\'9\\'></line><line x1=\\'15\\' y1=\\'9\\' x2=\\'15.01\\' y2=\\'9\\'></line></svg>'">
                </div>
                <span class="quicklink-name">${link.name}</span>
            `;
            
            linkEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.deleteLink(link.id);
            });
            
            this.elements.grid.appendChild(linkEl);
        });
    },
    
    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            // Попробуем несколько вариантов получения фавиконки
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>';
        }
    }
};

window.QuickLinksModule = QuickLinksModule; 