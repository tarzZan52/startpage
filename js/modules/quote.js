// Модуль цитат
const QuoteModule = {
    currentQuote: null,
    
    elements: {
        text: null,
        author: null,
        refreshBtn: null
    },
    
    quotes: [
        {
            text: "Единственный способ делать великую работу — это любить то, что ты делаешь.",
            author: "Стив Джобс"
        },
        {
            text: "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.",
            author: "Уинстон Черчилль"
        },
        {
            text: "В конце концов, важны не годы в вашей жизни, а жизнь в ваших годах.",
            author: "Авраам Линкольн"
        },
        {
            text: "Единственное, что стоит между вами и вашей целью — это история, которую вы продолжаете себе рассказывать о том, почему вы не можете её достичь.",
            author: "Джордан Белфорт"
        },
        {
            text: "Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.",
            author: "Китайская пословица"
        },
        {
            text: "Не важно, как медленно ты идешь, до тех пор, пока ты не остановишься.",
            author: "Конфуций"
        },
        {
            text: "Жизнь — это 10% того, что с тобой происходит, и 90% того, как ты на это реагируешь.",
            author: "Чарльз Р. Суиндолл"
        },
        {
            text: "Мотивация заставляет вас начать. Привычка заставляет продолжать.",
            author: "Джим Рон"
        },
        {
            text: "Делай сегодня то, что другие не хотят, завтра будешь жить так, как другие не могут.",
            author: "Джерри Райс"
        },
        {
            text: "Величайшая слава в жизни заключается не в том, чтобы никогда не падать, а в том, чтобы подниматься каждый раз, когда мы падаем.",
            author: "Нельсон Мандела"
        },
        {
            text: "Ваше время ограничено, не тратьте его, живя чужой жизнью.",
            author: "Стив Джобс"
        },
        {
            text: "Если вы хотите поднять себя, поднимите кого-то другого.",
            author: "Букер Т. Вашингтон"
        },
        {
            text: "Я не терпел поражений. Я просто нашёл 10 000 способов, которые не работают.",
            author: "Томас Эдисон"
        },
        {
            text: "Будущее принадлежит тем, кто верит в красоту своих мечтаний.",
            author: "Элеонора Рузвельт"
        },
        {
            text: "Качество — это не действие, это привычка.",
            author: "Аристотель"
        },
        {
            text: "Сложности — это то, что делает жизнь интересной. Их преодоление — это то, что делает жизнь значимой.",
            author: "Джошуа Дж. Марин"
        },
        {
            text: "Логика приведет вас из пункта А в пункт Б. Воображение приведет вас куда угодно.",
            author: "Альберт Эйнштейн"
        },
        {
            text: "Единственный человек, которым вам суждено стать — это тот, кем вы решите стать.",
            author: "Ральф Уолдо Эмерсон"
        },
        {
            text: "Начните оттуда, где вы находитесь. Используйте то, что у вас есть. Делайте то, что можете.",
            author: "Артур Эш"
        },
        {
            text: "Падение — это не провал. Провал — это остаться там, где упал.",
            author: "Сократ"
        }
    ],
    
    init() {
        this.loadElements();
        this.setupEventListeners();
        this.loadTodayQuote();
    },
    
    loadElements() {
        this.elements.text = document.getElementById('quoteText');
        this.elements.author = document.getElementById('quoteAuthor');
        this.elements.refreshBtn = document.getElementById('refreshQuoteBtn');
    },
    
    setupEventListeners() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshQuote());
        }
    },
    
    loadTodayQuote() {
        // Проверяем, есть ли сохраненная цитата на сегодня
        const saved = localStorage.getItem('quote_today');
        const today = new Date().toDateString();
        
        if (saved) {
            const data = JSON.parse(saved);
            if (data.date === today) {
                this.currentQuote = data.quote;
                this.displayQuote();
                return;
            }
        }
        
        // Если нет, выбираем новую цитату
        this.selectNewQuote();
    },
    
    selectNewQuote() {
        // Получаем индекс на основе текущей даты для стабильности
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % this.quotes.length;
        
        this.currentQuote = this.quotes[index];
        
        // Сохраняем цитату дня
        localStorage.setItem('quote_today', JSON.stringify({
            date: today.toDateString(),
            quote: this.currentQuote
        }));
        
        this.displayQuote();
    },
    
    refreshQuote() {
        // Анимация кнопки
        this.elements.refreshBtn.classList.add('rotating');
        
        // Выбираем случайную цитату
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        this.currentQuote = this.quotes[randomIndex];
        
        // Анимация исчезновения
        this.elements.text.style.opacity = '0';
        this.elements.author.style.opacity = '0';
        
        setTimeout(() => {
            this.displayQuote();
            
            // Анимация появления
            this.elements.text.style.opacity = '1';
            this.elements.author.style.opacity = '1';
            
            // Убираем анимацию с кнопки
            this.elements.refreshBtn.classList.remove('rotating');
        }, 300);
    },
    
    displayQuote() {
        if (!this.currentQuote || !this.elements.text || !this.elements.author) return;
        
        this.elements.text.textContent = this.currentQuote.text;
        this.elements.author.textContent = this.currentQuote.author;
        
        // Плавное появление
        this.elements.text.style.transition = 'opacity 0.5s ease';
        this.elements.author.style.transition = 'opacity 0.5s ease';
    }
};

window.QuoteModule = QuoteModule; 