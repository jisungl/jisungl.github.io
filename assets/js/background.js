(function() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.life = Math.random();
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life += this.fadeSpeed;
            
            if (this.x < 0 || this.x > width || 
                this.y < 0 || this.y > height || 
                this.life > 1) {
                this.reset();
            }
        }
        
        draw(isDark) {
            const alpha = Math.sin(this.life * Math.PI) * 0.3;
            const color = isDark ? '200, 180, 220' : '90, 61, 122';
            
            ctx.fillStyle = `rgba(${color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        const particleCount = Math.floor((width * height) / 15000);
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw(isDark);
        });
        
        requestAnimationFrame(draw);
    }
    
    resize();
    window.addEventListener('resize', resize);
    draw();
})();
