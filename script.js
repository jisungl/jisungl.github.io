// Navigation and Page Switching
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const navBubble = document.querySelector('.nav-bubble');
    const navbar = document.getElementById('navbar');
    
    // Initialize bubble position
    updateBubblePosition();
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetPage = this.getAttribute('data-page');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Switch pages
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
            
            // Update bubble position
            updateBubblePosition();
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // Update bubble position function
    function updateBubblePosition() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            const rect = activeLink.getBoundingClientRect();
            const navRect = document.querySelector('.nav-container').getBoundingClientRect();
            
            navBubble.style.width = rect.width + 'px';
            navBubble.style.height = rect.height + 'px';
            navBubble.style.left = (rect.left - navRect.left) + 'px';
            navBubble.style.top = (rect.top - navRect.top) + 'px';
        }
    }
    
    // Scroll handler for navbar styling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Update bubble position when scrolled (in case of resize)
            updateBubblePosition();
        }, 10);
    });
    
    // Handle window resize
    window.addEventListener('resize', updateBubblePosition);
    
    // Smooth scroll behavior for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Basketball Game
    const canvas = document.getElementById('basketballGame');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const shotCountEl = document.getElementById('shotCount');
        let shotCount = 0;
        
        // Game state
        let gameState = {
            ball: {
                x: 200,
                y: 450,
                radius: 20,
                vx: 0,
                vy: 0,
                dragging: false,
                shot: false
            },
            player: {
                x: 200,
                y: 500
            },
            hoop: {
                x: 650,
                y: 200,
                radius: 40
            }
        };
        
        // Physics constants
        const GRAVITY = 0.5;
        const DRAG_MULTIPLIER = 0.15;
        
        function drawPlayer() {
            ctx.fillStyle = '#5a3d7a';
            
            // Body
            ctx.fillRect(gameState.player.x - 15, gameState.player.y - 60, 30, 60);
            
            // Head
            ctx.beginPath();
            ctx.arc(gameState.player.x, gameState.player.y - 75, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Arms
            ctx.fillRect(gameState.player.x - 30, gameState.player.y - 50, 15, 40);
            ctx.fillRect(gameState.player.x + 15, gameState.player.y - 50, 15, 40);
            
            // Legs
            ctx.fillRect(gameState.player.x - 15, gameState.player.y, 12, 40);
            ctx.fillRect(gameState.player.x + 3, gameState.player.y, 12, 40);
        }
        
        function drawHoop() {
            // Backboard
            ctx.fillStyle = '#5a3d7a';
            ctx.fillRect(gameState.hoop.x - 5, gameState.hoop.y - 60, 10, 60);
            ctx.fillRect(gameState.hoop.x - 60, gameState.hoop.y - 60, 120, 10);
            
            // Rim
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(gameState.hoop.x, gameState.hoop.y, gameState.hoop.radius, 0, Math.PI, true);
            ctx.stroke();
            
            // Net
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            for (let i = -1; i <= 1; i += 0.5) {
                ctx.beginPath();
                ctx.moveTo(gameState.hoop.x + i * gameState.hoop.radius, gameState.hoop.y);
                ctx.lineTo(gameState.hoop.x + i * gameState.hoop.radius * 0.7, gameState.hoop.y + 40);
                ctx.stroke();
            }
        }
        
        function drawBall() {
            ctx.fillStyle = '#ff8c42';
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Basketball lines
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.ball.x - gameState.ball.radius, gameState.ball.y);
            ctx.lineTo(gameState.ball.x + gameState.ball.radius, gameState.ball.y);
            ctx.stroke();
        }
        
        function drawDragLine() {
            if (gameState.ball.dragging) {
                ctx.strokeStyle = 'rgba(90, 61, 122, 0.5)';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(200, 450);
                ctx.lineTo(gameState.ball.x, gameState.ball.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawPlayer();
            drawHoop();
            drawDragLine();
            drawBall();
        }
        
        function updatePhysics() {
            if (gameState.ball.shot) {
                gameState.ball.vy += GRAVITY;
                gameState.ball.x += gameState.ball.vx;
                gameState.ball.y += gameState.ball.vy;
                
                // Check if ball is scored or out of bounds
                const dx = gameState.ball.x - gameState.hoop.x;
                const dy = gameState.ball.y - gameState.hoop.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < gameState.hoop.radius && gameState.ball.y < gameState.hoop.y + 10 && gameState.ball.vy > 0) {
                    // Score
                    resetBall();
                    shotCount++;
                    shotCountEl.textContent = shotCount;
                } else if (gameState.ball.y > canvas.height || gameState.ball.x < 0 || gameState.ball.x > canvas.width) {
                    // Out of bounds
                    resetBall();
                }
            }
        }
        
        function resetBall() {
            gameState.ball.x = 200;
            gameState.ball.y = 450;
            gameState.ball.vx = 0;
            gameState.ball.vy = 0;
            gameState.ball.shot = false;
            gameState.ball.dragging = false;
        }
        
        function gameLoop() {
            updatePhysics();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const dx = mouseX - gameState.ball.x;
            const dy = mouseY - gameState.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < gameState.ball.radius && !gameState.ball.shot) {
                gameState.ball.dragging = true;
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (gameState.ball.dragging) {
                const rect = canvas.getBoundingClientRect();
                gameState.ball.x = e.clientX - rect.left;
                gameState.ball.y = e.clientY - rect.top;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            if (gameState.ball.dragging) {
                gameState.ball.dragging = false;
                gameState.ball.shot = true;
                
                // Calculate velocity based on drag distance
                gameState.ball.vx = (gameState.hoop.x - gameState.ball.x) * DRAG_MULTIPLIER;
                gameState.ball.vy = (gameState.hoop.y - gameState.ball.y) * DRAG_MULTIPLIER;
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            if (gameState.ball.dragging) {
                resetBall();
            }
        });
        
        // Start game loop
        gameLoop();
    }
});
