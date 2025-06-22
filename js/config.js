// Application configuration
const CONFIG = {
    // Search engines
    searchEngines: {
        duckduckgo: { 
            url: 'https://duckduckgo.com/?q=', 
            placeholder: 'Search on DuckDuckGo...' 
        },
        google: { 
            url: 'https://www.google.com/search?q=', 
            placeholder: 'Search on Google...' 
        },
        yandex: { 
            url: 'https://yandex.ru/search/?text=', 
            placeholder: 'Search on Yandex...' 
        }
    },
    
    // Default applications
    apps: [
        {
            id: 'default_chatgpt',
            name: 'ChatGPT',
            url: 'https://chat.openai.com',
            icon: 'icons/icons8-chatgpt.svg',
            isCustom: false
        },
        {
            id: 'default_claude',
            name: 'Claude',
            url: 'https://claude.ai',
            icon: 'icons/icons8-claude.svg',
            isCustom: false
        },
        {
            id: 'default_gemini',
            name: 'Gemini',
            url: 'https://gemini.google.com',
            icon: 'icons/icons8-gemini.svg',
            isCustom: false
        },
        {
            id: 'default_github',
            name: 'GitHub',
            url: 'https://github.com',
            icon: 'icons/icons8-github.svg',
            isCustom: false
        },
        {
            id: 'default_gmail',
            name: 'Gmail',
            url: 'https://mail.google.com',
            icon: 'icons/icons8-gmail.svg',
            isCustom: false
        }
    ],
    
    // Particles settings
    particles: {
        count: 100,
        minDuration: 15,
        maxDuration: 35
    },
    
    // Animation settings
    animation: {
        parallaxSpeed: 0.5,
        fogDriftSpeed: 60
    }
};