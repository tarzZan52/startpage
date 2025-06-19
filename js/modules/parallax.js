// Модуль для параллакс эффекта
const Parallax = {
    mouseX: 0,
    mouseY: 0,
    fogLayers: null,
    
    init() {
        this.fogLayers = document.querySelectorAll('.fog-layer');
        
        if (!this.fogLayers.length) {
            console.error('Fog layers not found');
            return;
        }
        
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.updateParallax();
    },
    
    handleMouseMove(e) {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    
    updateParallax() {
        this.fogLayers.forEach((layer, index) => {
            const speed = (index + 1) * CONFIG.animation.parallaxSpeed;
            const x = this.mouseX * speed * 10;
            const y = this.mouseY * speed * 10;
            layer.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        requestAnimationFrame(() => this.updateParallax());
    }
};