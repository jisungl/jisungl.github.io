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
        let makes = 0;
        let attempts = 0;
        
        // Game state
        let gameState = {
            ball: {
                x: 144,
                y: 468,  // Scaled up from 390
                startX: 144,
                startY: 468,
                radius: 14,  // Scaled up from 12
                vx: 0,
                vy: 0,
                dragging: false,
                shot: false,
                scored: false
            },
            player: {
                x: 96,  // Scaled up from 80
                y: 504  // Scaled up from 420
            },
            hoop: {
                x: 504,  // Scaled up from 420
                y: 432,  // Scaled up from 360
                rimRadius: 36,  // Scaled up from 30
                backboardX: 540  // Scaled up from 450
            },
            ground: 540  // Scaled up from 450
        };
        
        // Physics constants
        const GRAVITY = 0.35;
        const LAUNCH_MULTIPLIER = 0.18;  // Increased for better power consistency
        const BOUNCE_DAMPING = 0.6;
        
        function drawPlayer() {
            const y = gameState.ground;
            ctx.fillStyle = '#5a3d7a';
            ctx.strokeStyle = '#5a3d7a';
            ctx.lineWidth = 3;
            
            // Head
            ctx.beginPath();
            ctx.arc(gameState.player.x, y - 60, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 48);
            ctx.lineTo(gameState.player.x, y - 12);
            ctx.stroke();
            
            // Arms
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 42);
            ctx.lineTo(gameState.player.x + 22, y - 30);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 42);
            ctx.lineTo(gameState.player.x - 22, y - 30);
            ctx.stroke();
            
            // Legs - touching ground
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 12);
            ctx.lineTo(gameState.player.x - 10, y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 12);
            ctx.lineTo(gameState.player.x + 10, y);
            ctx.stroke();
        }
        
        function drawHoop() {
            // Backboard
            ctx.fillStyle = '#5a3d7a';
            ctx.fillRect(gameState.hoop.backboardX, gameState.hoop.y - 48, 7, 60);
            
            // Rim - thicker for collision detection
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.lineTo(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.stroke();
            
            // Rim edges (for visual)
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Net lines - WHITE
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = -30; i <= 30; i += 15) {
                ctx.beginPath();
                ctx.moveTo(gameState.hoop.x + i, gameState.hoop.y);
                ctx.lineTo(gameState.hoop.x + i * 0.6, gameState.hoop.y + 36);
                ctx.stroke();
            }
        }
        
        function drawStats() {
            // Draw stats centered at top
            const boxWidth = 132;  // Scaled up from 110
            const boxX = (canvas.width - boxWidth) / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(boxX, 12, boxWidth, 60);
            
            ctx.fillStyle = '#5a3d7a';
            ctx.font = 'bold 22px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            
            const pct = attempts > 0 ? ((makes / attempts) * 100).toFixed(1) : 0;
            ctx.fillText(`${makes}/${attempts}`, boxX + boxWidth / 2, 36);
            ctx.fillText(`${pct}%`, boxX + boxWidth / 2, 60);
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
        
        function drawTrajectoryPreview() {
            if (gameState.ball.dragging) {
                // Use the same calculation as the actual shot
                const dragX = gameState.ball.x - gameState.ball.startX;
                const dragY = gameState.ball.y - gameState.ball.startY;
                const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
                
                let vx = 0;
                let vy = 0;
                
                if (dragDistance > 0) {
                    const dirX = dragX / dragDistance;
                    const dirY = dragY / dragDistance;
                    const power = dragDistance * LAUNCH_MULTIPLIER;
                    vx = -dirX * power;
                    vy = -dirY * power;
                }
                
                // Draw dotted trajectory line
                ctx.strokeStyle = 'rgba(90, 61, 122, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(gameState.ball.startX, gameState.ball.startY);
                
                let px = gameState.ball.startX;
                let py = gameState.ball.startY;
                let pvx = vx;
                let pvy = vy;
                
                // Simulate trajectory (shortened for difficulty)
                for (let i = 0; i < 22; i++) {
                    pvy += GRAVITY;
                    px += pvx;
                    py += pvy;
                    ctx.lineTo(px, py);
                    if (py > canvas.height || px < 0 || px > canvas.width) break;
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        function checkRimCollision() {
            const leftRim = gameState.hoop.x - gameState.hoop.rimRadius;
            const rightRim = gameState.hoop.x + gameState.hoop.rimRadius;
            const rimY = gameState.hoop.y;
            
            // Check collision with left rim edge
            if (Math.abs(gameState.ball.x - leftRim) < gameState.ball.radius &&
                Math.abs(gameState.ball.y - rimY) < gameState.ball.radius) {
                gameState.ball.vx = -Math.abs(gameState.ball.vx) * BOUNCE_DAMPING;
                gameState.ball.vy *= BOUNCE_DAMPING;
                return true;
            }
            
            // Check collision with right rim edge
            if (Math.abs(gameState.ball.x - rightRim) < gameState.ball.radius &&
                Math.abs(gameState.ball.y - rimY) < gameState.ball.radius) {
                gameState.ball.vx = Math.abs(gameState.ball.vx) * BOUNCE_DAMPING;
                gameState.ball.vy *= BOUNCE_DAMPING;
                return true;
            }
            
            return false;
        }
        
        function checkBackboardCollision() {
            const backboardX = gameState.hoop.backboardX;
            const backboardTop = gameState.hoop.y - 40;
            const backboardBottom = gameState.hoop.y + 10;
            
            // Check if ball hits backboard
            if (gameState.ball.x + gameState.ball.radius >= backboardX &&
                gameState.ball.y >= backboardTop &&
                gameState.ball.y <= backboardBottom &&
                gameState.ball.vx > 0) {
                gameState.ball.vx = -gameState.ball.vx * BOUNCE_DAMPING;
                gameState.ball.x = backboardX - gameState.ball.radius;
                return true;
            }
            return false;
        }
        
        function checkScore() {
            const ballBottom = gameState.ball.y + gameState.ball.radius;
            const ballTop = gameState.ball.y - gameState.ball.radius;
            const hoopY = gameState.hoop.y;
            const leftRim = gameState.hoop.x - gameState.hoop.rimRadius;
            const rightRim = gameState.hoop.x + gameState.hoop.rimRadius;
            
            // Ball is within rim horizontally and passing through
            if (gameState.ball.x > leftRim + gameState.ball.radius && 
                gameState.ball.x < rightRim - gameState.ball.radius &&
                ballTop <= hoopY && 
                ballBottom >= hoopY && 
                gameState.ball.vy > 0) {
                return true;
            }
            return false;
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw court floor
            ctx.fillStyle = 'rgba(90, 61, 122, 0.1)';
            ctx.fillRect(0, gameState.ground, canvas.width, canvas.height - gameState.ground);
            
            drawPlayer();
            drawHoop();
            drawTrajectoryPreview();
            drawBall();
            drawStats();
        }
        
        function updatePhysics() {
            if (gameState.ball.shot) {
                // Apply gravity
                gameState.ball.vy += GRAVITY;
                
                // Update position
                gameState.ball.x += gameState.ball.vx;
                gameState.ball.y += gameState.ball.vy;
                
                // Check collisions
                checkBackboardCollision();
                checkRimCollision();
                
                // Check for score
                if (checkScore() && !gameState.ball.scored) {
                    gameState.ball.scored = true;
                    makes++;
                }
                
                // Ground collision
                if (gameState.ball.y + gameState.ball.radius >= gameState.ground) {
                    gameState.ball.y = gameState.ground - gameState.ball.radius;
                    gameState.ball.vy = -gameState.ball.vy * 0.5;
                    gameState.ball.vx *= 0.8;
                    
                    // Stop if bouncing too slowly
                    if (Math.abs(gameState.ball.vy) < 1) {
                        resetBall();
                    }
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
                // Calculate drag distance and direction BEFORE resetting position
                const dragX = gameState.ball.x - gameState.ball.startX;
                const dragY = gameState.ball.y - gameState.ball.startY;
                const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
                
                // Reset ball to starting position for the shot
                gameState.ball.x = gameState.ball.startX;
                gameState.ball.y = gameState.ball.startY;
                
                gameState.ball.dragging = false;
                gameState.ball.shot = true;
                attempts++;
                
                if (dragDistance > 0) {
                    // Normalize direction and apply opposite direction with consistent power
                    const dirX = dragX / dragDistance;
                    const dirY = dragY / dragDistance;
                    
                    // Power scales with distance, direction is opposite of drag
                    const power = dragDistance * LAUNCH_MULTIPLIER;
                    gameState.ball.vx = -dirX * power;
                    gameState.ball.vy = -dirY * power;
                } else {
                    // If no drag, no shot
                    gameState.ball.vx = 0;
                    gameState.ball.vy = 0;
                }
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
    
    // Project Modal Functionality
    const modal = document.getElementById('projectModal');
    const projectFrame = document.getElementById('projectFrame');
    const modalClose = document.querySelector('.modal-close');
    const projectItems = document.querySelectorAll('.project-item[data-project]');
    
    // Notes Modal Functionality
    const notesModal = document.getElementById('notesModal');
    const notesClose = document.querySelector('.notes-close');
    const notepadIcons = document.querySelectorAll('.notepad-icon');
    
    // Project file mapping
    const projectFiles = {
        'nfl': 'two-high-safety.html'
        // Add more projects here as needed
    };
    
    // Open project modal when clicking project item
    projectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't open project modal if clicking on notepad icon
            if (e.target.closest('.notepad-icon')) {
                return;
            }
            
            const projectId = this.getAttribute('data-project');
            const projectFile = projectFiles[projectId];
            
            if (projectFile) {
                projectFrame.src = projectFile;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Open notes modal when clicking notepad icon
    notepadIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering project item click
            notesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close project modal
    function closeModal() {
        modal.classList.remove('active');
        projectFrame.src = '';
        document.body.style.overflow = 'auto';
    }
    
    // Close notes modal
    function closeNotesModal() {
        notesModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    modalClose.addEventListener('click', closeModal);
    notesClose.addEventListener('click', closeNotesModal);
    
    // Close when clicking outside modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    notesModal.addEventListener('click', function(e) {
        if (e.target === notesModal) {
            closeNotesModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            }
            if (notesModal.classList.contains('active')) {
                closeNotesModal();
            }
        }
    });
});
