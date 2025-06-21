// Модуль криптовалют  
const CryptoModule = {
    cryptoList: null,
    refreshBtn: null,
    lastUpdate: null,
    refreshInterval: null,
    
    // Топ-6 самых популярных криптовалют
    coinIds: ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'cardano'],
    
    init() {
        this.cryptoList = document.getElementById('cryptoList');
        this.refreshBtn = document.getElementById('cryptoRefresh');
        
        if (!this.cryptoList || !this.refreshBtn) {
            console.error('Crypto elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.refresh();
        this.startAutoRefresh();
    },
    
    setupEventListeners() {
        this.refreshBtn.addEventListener('click', () => {
            this.refresh();
        });
    },
    
    async refresh() {
        this.showLoading();
        
        try {
            const data = await this.fetchCryptoData();
            this.displayCryptoData(data);
            this.lastUpdate = new Date();
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            this.showError();
        }
    },
    
    async fetchCryptoData() {
        const coinIdsString = this.coinIds.join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsString}&vs_currencies=usd&include_24hr_change=true`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Преобразуем данные в нужный формат
        return this.coinIds.map(coinId => {
            const coinData = data[coinId];
            if (!coinData) return null;
            
            return {
                id: coinId,
                name: this.getCoinName(coinId),
                symbol: this.getCoinSymbol(coinId),
                price: coinData.usd,
                change24h: coinData.usd_24h_change
            };
        }).filter(coin => coin !== null);
    },
    
    getCoinName(coinId) {
        const names = {
            'bitcoin': 'Bitcoin',
            'ethereum': 'Ethereum',
            'tether': 'Tether',
            'binancecoin': 'BNB',
            'solana': 'Solana',
            'cardano': 'Cardano'
        };
        return names[coinId] || coinId;
    },
    
    getCoinSymbol(coinId) {
        const symbols = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'tether': 'USDT',
            'binancecoin': 'BNB',
            'solana': 'SOL',
            'cardano': 'ADA'
        };
        return symbols[coinId] || coinId.toUpperCase();
    },
    
    displayCryptoData(cryptoData) {
        this.cryptoList.innerHTML = '';
        
        cryptoData.forEach(coin => {
            const cryptoItem = this.createCryptoItem(coin);
            this.cryptoList.appendChild(cryptoItem);
        });
    },
    
    createCryptoItem(coin) {
        const item = document.createElement('div');
        item.className = 'crypto-item';
        
        const isPositive = coin.change24h > 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeSign = isPositive ? '+' : '';
        const arrow = isPositive ? '↗' : '↘';
        
        item.innerHTML = `
            <div class="crypto-info">
                <div class="crypto-name">${coin.name}</div>
                <div class="crypto-symbol">${coin.symbol}</div>
            </div>
            <div class="crypto-price-section">
                <div class="crypto-price">$${this.formatPrice(coin.price)}</div>
                <div class="crypto-change ${changeClass}">
                    ${arrow} ${changeSign}${Math.abs(coin.change24h).toFixed(2)}%
                </div>
            </div>
        `;
        
        return item;
    },
    
    formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else if (price >= 1) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else if (price >= 0.01) {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4
            });
        } else {
            return price.toLocaleString('en-US', {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6
            });
        }
    },
    
    showLoading() {
        this.cryptoList.innerHTML = '<div class="crypto-loading">Загрузка...</div>';
        this.refreshBtn.style.opacity = '0.5';
        this.refreshBtn.style.pointerEvents = 'none';
    },
    
    showError() {
        this.cryptoList.innerHTML = `
            <div class="crypto-loading" style="color: #f87171;">
                Ошибка загрузки данных
                <br>
                <small style="margin-top: 8px; display: block; font-size: 0.8rem;">
                    Проверьте подключение к интернету
                </small>
            </div>
        `;
        
        this.refreshBtn.style.opacity = '1';
        this.refreshBtn.style.pointerEvents = 'auto';
    },
    
    startAutoRefresh() {
        // Обновляем данные каждые 5 минут
        this.refreshInterval = setInterval(() => {
            if (Dashboard && Dashboard.isActive) {
                this.refresh();
            }
        }, 5 * 60 * 1000);
    },
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    },
    
    destroy() {
        this.stopAutoRefresh();
        this.refreshBtn.style.opacity = '1';
        this.refreshBtn.style.pointerEvents = 'auto';
    }
};

// Экспорт модуля
window.CryptoModule = CryptoModule; 