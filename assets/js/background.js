// Flowing particles background animation
(function() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) {
        console.error('Background canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Particle class
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
            
            // Reset if out of bounds or fully faded
            if (this.x < 0 || this.x > width || 
                this.y < 0 || this.y > height || 
                this.life > 1) {
                this.reset();
            }
        }
        
        draw(isDark) {
            const alpha = Math.sin(this.life * Math.PI) * 0.3;
            const color = isDark ? '90, 61, 122' : '90, 61, 122';
            
            ctx.fillStyle = `rgba(${color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Resize canvas to match window
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // Recreate particles on resize
        const particleCount = Math.floor((width * height) / 15000);
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function draw() {
        // Get current theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw(isDark);
        });
        
        requestAnimationFrame(draw);
    }
    
    // Initialize
    resize();
    window.addEventListener('resize', resize);
    draw();
    
    console.log('Background animation initialized');
})();
