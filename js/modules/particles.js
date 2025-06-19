// Модуль для создания и управления частицами
const Particles = {
    container: null,
    
    init() {
        this.container = document.getElementById('particles');
        if (!this.container) {
            console.error('Particles container not found');
            return;
        }
        
        // Проверяем, не созданы ли уже частицы
        if (this.container.children.length > 0) {
            return;
        }
        
        this.createParticles();
    },
    
    createParticles() {
        const { count, minDuration, maxDuration } = CONFIG.particles;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * (maxDuration - minDuration) + minDuration}s`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            
            // Варьируем траекторию движения
            const drift = Math.random() * 200 - 100;
            particle.style.setProperty('--drift', `${drift}px`);
            
            this.container.appendChild(particle);
        }
    }
};