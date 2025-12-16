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
        const shotStatsEl = document.getElementById('shotStats');
        const shootingPctEl = document.getElementById('shootingPct');
        let makes = 0;
        let attempts = 0;
        
        // Game state
        let gameState = {
            ball: {
                x: 150,
                y: 400,
                startX: 150,
                startY: 400,
                radius: 15,
                vx: 0,
                vy: 0,
                dragging: false,
                shot: false
            },
            player: {
                x: 100,
                y: 400
            },
            hoop: {
                x: 700,
                y: 400,
                rimRadius: 35
            }
        };
        
        // Physics constants
        const GRAVITY = 0.4;
        const LAUNCH_MULTIPLIER = 0.2;
        
        function drawPlayer() {
            ctx.fillStyle = '#5a3d7a';
            
            // Simple stick figure
            // Head
            ctx.beginPath();
            ctx.arc(gameState.player.x, gameState.player.y - 40, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y - 28);
            ctx.lineTo(gameState.player.x, gameState.player.y + 10);
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Arms
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y - 20);
            ctx.lineTo(gameState.player.x + 20, gameState.player.y - 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y - 20);
            ctx.lineTo(gameState.player.x - 20, gameState.player.y - 10);
            ctx.stroke();
            
            // Legs
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y + 10);
            ctx.lineTo(gameState.player.x - 10, gameState.player.y + 30);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y + 10);
            ctx.lineTo(gameState.player.x + 10, gameState.player.y + 30);
            ctx.stroke();
        }
        
        function drawHoop() {
            // Backboard
            ctx.fillStyle = '#5a3d7a';
            ctx.fillRect(gameState.hoop.x + 40, gameState.hoop.y - 50, 8, 60);
            
            // Rim - horizontal line
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.lineTo(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.stroke();
            
            // Net lines
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            for (let i = -30; i <= 30; i += 15) {
                ctx.beginPath();
                ctx.moveTo(gameState.hoop.x + i, gameState.hoop.y);
                ctx.lineTo(gameState.hoop.x + i * 0.6, gameState.hoop.y + 35);
                ctx.stroke();
            }
        }
        
        function drawBall() {
            // Basketball
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
        }
        
        function drawDragLine() {
            if (gameState.ball.dragging) {
                // Show trajectory line
                ctx.strokeStyle = 'rgba(90, 61, 122, 0.4)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(gameState.ball.startX, gameState.ball.startY);
                ctx.lineTo(gameState.ball.x, gameState.ball.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw court line
            ctx.strokeStyle = 'rgba(90, 61, 122, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 450);
            ctx.lineTo(canvas.width, 450);
            ctx.stroke();
            
            drawPlayer();
            drawHoop();
            drawDragLine();
            drawBall();
        }
        
        function checkScore() {
            // Check if ball passes through the hoop
            const ballBottom = gameState.ball.y + gameState.ball.radius;
            const ballTop = gameState.ball.y - gameState.ball.radius;
            const hoopY = gameState.hoop.y;
            
            // Ball is at the right horizontal position
            if (Math.abs(gameState.ball.x - gameState.hoop.x) < gameState.hoop.rimRadius - gameState.ball.radius) {
                // Ball is passing through the hoop level
                if (ballTop <= hoopY && ballBottom >= hoopY && gameState.ball.vy > 0) {
                    return true;
                }
            }
            return false;
        }
        
        function updatePhysics() {
            if (gameState.ball.shot) {
                // Apply gravity
                gameState.ball.vy += GRAVITY;
                
                // Update position
                gameState.ball.x += gameState.ball.vx;
                gameState.ball.y += gameState.ball.vy;
                
                // Check for score
                if (checkScore() && !gameState.ball.scored) {
                    gameState.ball.scored = true;
                    makes++;
                    updateStats();
                }
                
                // Check if ball is out of bounds
                if (gameState.ball.y > canvas.height + 50 || 
                    gameState.ball.x < -50 || 
                    gameState.ball.x > canvas.width + 50 ||
                    gameState.ball.y < -50) {
                    resetBall();
                }
            }
        }
        
        function updateStats() {
            shotStatsEl.textContent = `${makes}/${attempts}`;
            const pct = attempts > 0 ? ((makes / attempts) * 100).toFixed(1) : 0;
            shootingPctEl.textContent = `${pct}%`;
        }
        
        function resetBall() {
            gameState.ball.x = gameState.ball.startX;
            gameState.ball.y = gameState.ball.startY;
            gameState.ball.vx = 0;
            gameState.ball.vy = 0;
            gameState.ball.shot = false;
            gameState.ball.dragging = false;
            gameState.ball.scored = false;
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
            
            if (distance < gameState.ball.radius * 2 && !gameState.ball.shot) {
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
                attempts++;
                
                // Rubber band effect: velocity is opposite of drag direction
                const dragX = gameState.ball.x - gameState.ball.startX;
                const dragY = gameState.ball.y - gameState.ball.startY;
                
                gameState.ball.vx = -dragX * LAUNCH_MULTIPLIER;
                gameState.ball.vy = -dragY * LAUNCH_MULTIPLIER;
                
                updateStats();
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            if (gameState.ball.dragging) {
                resetBall();
            }
        });
        
        // Start game loop
        updateStats();
        gameLoop();
    }
});
