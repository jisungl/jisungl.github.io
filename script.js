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
                x: 120,
                y: 390,  // Lowered slightly from 380
                startX: 120,
                startY: 390,
                radius: 12,
                vx: 0,
                vy: 0,
                dragging: false,
                shot: false,
                scored: false
            },
            player: {
                x: 80,
                y: 420  // Ground level
            },
            hoop: {
                x: 420,
                y: 360,  // Slightly above player
                rimRadius: 30,
                backboardX: 450
            },
            ground: 450
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
            ctx.arc(gameState.player.x, y - 50, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 40);
            ctx.lineTo(gameState.player.x, y - 10);
            ctx.stroke();
            
            // Arms
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 35);
            ctx.lineTo(gameState.player.x + 18, y - 25);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 35);
            ctx.lineTo(gameState.player.x - 18, y - 25);
            ctx.stroke();
            
            // Legs - touching ground
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 10);
            ctx.lineTo(gameState.player.x - 8, y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 10);
            ctx.lineTo(gameState.player.x + 8, y);
            ctx.stroke();
        }
        
        function drawHoop() {
            // Backboard
            ctx.fillStyle = '#5a3d7a';
            ctx.fillRect(gameState.hoop.backboardX, gameState.hoop.y - 40, 6, 50);
            
            // Rim - thicker for collision detection
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.lineTo(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.stroke();
            
            // Rim edges (for visual)
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Net lines - WHITE
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            for (let i = -25; i <= 25; i += 12) {
                ctx.beginPath();
                ctx.moveTo(gameState.hoop.x + i, gameState.hoop.y);
                ctx.lineTo(gameState.hoop.x + i * 0.6, gameState.hoop.y + 30);
                ctx.stroke();
            }
        }
        
        function drawStats() {
            // Draw stats in top-right corner
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(canvas.width - 120, 10, 110, 50);
            
            ctx.fillStyle = '#5a3d7a';
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            
            const pct = attempts > 0 ? ((makes / attempts) * 100).toFixed(1) : 0;
            ctx.fillText(`${makes}/${attempts}`, canvas.width - 65, 30);
            ctx.fillText(`${pct}%`, canvas.width - 65, 50);
        }
        
        function drawBall() {
            // Basketball
            ctx.fillStyle = '#ff8c42';
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Basketball lines
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
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
                
                // Simulate trajectory
                for (let i = 0; i < 40; i++) {
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
    
    // Field Goal Game
    const fgCanvas = document.getElementById('fieldGoalGame');
    if (fgCanvas) {
        const fgCtx = fgCanvas.getContext('2d');
        let homeScore = 0;
        let awayScore = 0;
        
        // Game state
        let fgState = {
            ball: {
                x: 250,
                y: 420,
                startX: 250,
                startY: 420,
                radius: 25,
                vx: 0,
                vy: 0,
                vz: 0,  // depth velocity
                z: 0,   // depth position
                dragging: false,
                kicked: false,
                scored: false
            },
            goalpost: {
                leftX: 180,
                rightX: 320,
                y: 100,
                z: 800  // distance to goalposts
            }
        };
        
        // Physics constants
        const FG_GRAVITY = 0.25;
        const FG_KICK_MULTIPLIER = 0.12;
        
        function drawField() {
            // Green field
            fgCtx.fillStyle = '#2d5016';
            fgCtx.fillRect(0, 350, fgCanvas.width, fgCanvas.height - 350);
            
            // Yard lines for perspective
            for (let i = 0; i < 5; i++) {
                const y = 350 + i * 30;
                const alpha = 0.3 - i * 0.05;
                fgCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                fgCtx.lineWidth = 2;
                fgCtx.beginPath();
                fgCtx.moveTo(0, y);
                fgCtx.lineTo(fgCanvas.width, y);
                fgCtx.stroke();
            }
        }
        
        function drawGoalpost() {
            // Calculate perspective scale based on depth
            const scale = 1 - (fgState.goalpost.z / 1000);
            const postY = fgState.goalpost.y;
            
            // Posts (yellow)
            fgCtx.strokeStyle = '#ffcc00';
            fgCtx.lineWidth = 8 * scale;
            
            // Left post
            fgCtx.beginPath();
            fgCtx.moveTo(fgState.goalpost.leftX, postY);
            fgCtx.lineTo(fgState.goalpost.leftX, postY + 150 * scale);
            fgCtx.stroke();
            
            // Right post
            fgCtx.beginPath();
            fgCtx.moveTo(fgState.goalpost.rightX, postY);
            fgCtx.lineTo(fgState.goalpost.rightX, postY + 150 * scale);
            fgCtx.stroke();
            
            // Crossbar
            fgCtx.beginPath();
            fgCtx.moveTo(fgState.goalpost.leftX, postY);
            fgCtx.lineTo(fgState.goalpost.rightX, postY);
            fgCtx.stroke();
        }
        
        function drawFootball() {
            if (fgState.ball.kicked) {
                // Calculate size based on depth
                const scale = Math.max(0.1, 1 - (fgState.ball.z / fgState.goalpost.z));
                const radius = fgState.ball.radius * scale;
                
                // Draw football (brown)
                fgCtx.fillStyle = '#8b4513';
                fgCtx.beginPath();
                fgCtx.ellipse(fgState.ball.x, fgState.ball.y, radius * 1.3, radius * 0.9, Math.PI / 4, 0, Math.PI * 2);
                fgCtx.fill();
                
                // Laces
                fgCtx.strokeStyle = '#ffffff';
                fgCtx.lineWidth = 1;
                fgCtx.beginPath();
                fgCtx.moveTo(fgState.ball.x - radius * 0.5, fgState.ball.y);
                fgCtx.lineTo(fgState.ball.x + radius * 0.5, fgState.ball.y);
                fgCtx.stroke();
            } else {
                // Draw full size football at bottom
                fgCtx.fillStyle = '#8b4513';
                fgCtx.beginPath();
                fgCtx.ellipse(fgState.ball.x, fgState.ball.y, fgState.ball.radius * 1.3, fgState.ball.radius * 0.9, Math.PI / 4, 0, Math.PI * 2);
                fgCtx.fill();
                
                // Laces
                fgCtx.strokeStyle = '#ffffff';
                fgCtx.lineWidth = 2;
                fgCtx.beginPath();
                fgCtx.moveTo(fgState.ball.x - fgState.ball.radius * 0.6, fgState.ball.y);
                fgCtx.lineTo(fgState.ball.x + fgState.ball.radius * 0.6, fgState.ball.y);
                fgCtx.stroke();
                
                for (let i = -2; i <= 2; i++) {
                    fgCtx.beginPath();
                    fgCtx.moveTo(fgState.ball.x + i * 6, fgState.ball.y - 4);
                    fgCtx.lineTo(fgState.ball.x + i * 6, fgState.ball.y + 4);
                    fgCtx.stroke();
                }
            }
        }
        
        function drawScoreboard() {
            // Scoreboard background
            fgCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            fgCtx.fillRect(10, 10, 120, 80);
            
            fgCtx.fillStyle = '#ffffff';
            fgCtx.font = 'bold 14px "Outfit", sans-serif';
            fgCtx.textAlign = 'left';
            
            // Away team
            fgCtx.fillText('AWAY', 20, 30);
            fgCtx.font = 'bold 24px "Outfit", sans-serif';
            fgCtx.fillText(awayScore.toString(), 80, 35);
            
            // Home team
            fgCtx.font = 'bold 14px "Outfit", sans-serif';
            fgCtx.fillText('HOME', 20, 60);
            fgCtx.font = 'bold 24px "Outfit", sans-serif';
            fgCtx.fillText(homeScore.toString(), 80, 65);
        }
        
        function drawKickPreview() {
            if (fgState.ball.dragging) {
                // Show kick direction arrow
                const dragX = fgState.ball.x - fgState.ball.startX;
                const dragY = fgState.ball.y - fgState.ball.startY;
                
                if (Math.abs(dragX) > 5 || Math.abs(dragY) > 5) {
                    fgCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    fgCtx.lineWidth = 3;
                    fgCtx.setLineDash([5, 5]);
                    fgCtx.beginPath();
                    fgCtx.moveTo(fgState.ball.startX, fgState.ball.startY);
                    fgCtx.lineTo(fgState.ball.x, fgState.ball.y);
                    fgCtx.stroke();
                    fgCtx.setLineDash([]);
                }
            }
        }
        
        function checkFieldGoal() {
            // Check if ball is at goalpost depth and between posts
            if (fgState.ball.z >= fgState.goalpost.z && !fgState.ball.scored) {
                const leftPost = fgState.goalpost.leftX;
                const rightPost = fgState.goalpost.rightX;
                const crossbarY = fgState.goalpost.y;
                
                if (fgState.ball.x > leftPost && fgState.ball.x < rightPost && fgState.ball.y < crossbarY) {
                    fgState.ball.scored = true;
                    homeScore += 3;
                    return true;
                }
            }
            return false;
        }
        
        function fgDraw() {
            fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
            
            // Sky
            fgCtx.fillStyle = '#87ceeb';
            fgCtx.fillRect(0, 0, fgCanvas.width, 350);
            
            drawField();
            drawGoalpost();
            drawKickPreview();
            drawFootball();
            drawScoreboard();
        }
        
        function fgUpdatePhysics() {
            if (fgState.ball.kicked) {
                // Apply gravity
                fgState.ball.vy += FG_GRAVITY;
                
                // Update position
                fgState.ball.x += fgState.ball.vx;
                fgState.ball.y += fgState.ball.vy;
                fgState.ball.z += fgState.ball.vz;
                
                // Check for field goal
                checkFieldGoal();
                
                // Reset if ball goes too far or hits ground
                if (fgState.ball.z > fgState.goalpost.z + 100 || 
                    fgState.ball.y > 450 ||
                    fgState.ball.x < -50 || 
                    fgState.ball.x > fgCanvas.width + 50) {
                    fgResetBall();
                }
            }
        }
        
        function fgResetBall() {
            fgState.ball.x = fgState.ball.startX;
            fgState.ball.y = fgState.ball.startY;
            fgState.ball.z = 0;
            fgState.ball.vx = 0;
            fgState.ball.vy = 0;
            fgState.ball.vz = 0;
            fgState.ball.kicked = false;
            fgState.ball.dragging = false;
            fgState.ball.scored = false;
        }
        
        function fgGameLoop() {
            fgUpdatePhysics();
            fgDraw();
            requestAnimationFrame(fgGameLoop);
        }
        
        // Mouse events for field goal
        fgCanvas.addEventListener('mousedown', (e) => {
            const rect = fgCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const dx = mouseX - fgState.ball.x;
            const dy = mouseY - fgState.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < fgState.ball.radius * 2 && !fgState.ball.kicked) {
                fgState.ball.dragging = true;
            }
        });
        
        fgCanvas.addEventListener('mousemove', (e) => {
            if (fgState.ball.dragging) {
                const rect = fgCanvas.getBoundingClientRect();
                fgState.ball.x = e.clientX - rect.left;
                fgState.ball.y = e.clientY - rect.top;
            }
        });
        
        fgCanvas.addEventListener('mouseup', () => {
            if (fgState.ball.dragging) {
                // Calculate kick vector
                const dragX = fgState.ball.x - fgState.ball.startX;
                const dragY = fgState.ball.y - fgState.ball.startY;
                const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
                
                // Reset to starting position
                fgState.ball.x = fgState.ball.startX;
                fgState.ball.y = fgState.ball.startY;
                
                fgState.ball.dragging = false;
                fgState.ball.kicked = true;
                
                if (dragDistance > 0) {
                    const dirX = dragX / dragDistance;
                    const dirY = dragY / dragDistance;
                    const power = dragDistance * FG_KICK_MULTIPLIER;
                    
                    fgState.ball.vx = -dirX * power;
                    fgState.ball.vy = -dirY * power;
                    // Forward velocity (into screen)
                    fgState.ball.vz = power * 3;
                }
            }
        });
        
        fgCanvas.addEventListener('mouseleave', () => {
            if (fgState.ball.dragging) {
                fgResetBall();
            }
        });
        
        // Start field goal game loop
        fgGameLoop();
    }
});
