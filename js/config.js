// Конфигурация приложения
const CONFIG = {
    // Поисковые системы
    searchEngines: {
        duckduckgo: { 
            url: 'https://duckduckgo.com/?q=', 
            placeholder: 'Поиск в DuckDuckGo...' 
        },
        google: { 
            url: 'https://www.google.com/search?q=', 
            placeholder: 'Поиск в Google...' 
        },
        yandex: { 
            url: 'https://yandex.ru/search/?text=', 
            placeholder: 'Поиск в Яндексе...' 
        }
    },
    
    // Приложения
    apps: [
        {
            name: 'ChatGPT',
            url: 'https://chat.openai.com',
            icon: 'icons/icons8-chatgpt.svg',
            class: 'chatgpt'
        },
        {
            name: 'Claude',
            url: 'https://claude.ai',
            icon: 'icons/icons8-claude.svg',
            class: 'claude'
        },
        {
            name: 'Gemini',
            url: 'https://gemini.google.com',
            icon: 'icons/icons8-gemini.svg',
            class: 'gemini'
        },
        {
            name: 'GitHub',
            url: 'https://github.com',
            icon: 'icons/icons8-github.svg',
            class: 'github'
        },
        {
            name: 'Gmail',
            url: 'https://mail.google.com',
            icon: 'icons/icons8-gmail.svg',
            class: 'gmail'
        }
    ],
    
    // Настройки частиц
    particles: {
        count: 100,
        minDuration: 15,
        maxDuration: 35
    },
    
    // Настройки анимации
    animation: {
        parallaxSpeed: 0.5,
        fogDriftSpeed: 60
    }
};