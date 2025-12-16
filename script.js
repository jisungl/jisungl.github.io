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
            // Draw stats centered at top
            const boxWidth = 110;
            const boxX = (canvas.width - boxWidth) / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(boxX, 10, boxWidth, 50);
            
            ctx.fillStyle = '#5a3d7a';
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            
            const pct = attempts > 0 ? ((makes / attempts) * 100).toFixed(1) : 0;
            ctx.fillText(`${makes}/${attempts}`, boxX + boxWidth / 2, 30);
            ctx.fillText(`${pct}%`, boxX + boxWidth / 2, 50);
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
                rotation: Math.PI / 2,  // Start vertical (90 degrees)
                dragging: false,
                flicking: false,
                kicked: false,
                scored: false
            },
            goalpost: {
                baseX: 250,
                baseY: 200,  // Higher up to appear further
                postHeight: 50,  // Shorter vertical post
                crossbarWidth: 120,  // Wider crossbar
                uprightHeight: 100,  // Taller uprights
                z: 800  // distance to goalposts
            },
            dragStartX: 0,
            dragStartY: 0,
            dragStartTime: 0
        };
        
        // Physics constants
        const FG_GRAVITY = 0.3;
        const FG_FLICK_MULTIPLIER = 0.15;
        
        function drawGoalpost() {
            const scale = 0.6;  // Make it appear further away
            const baseX = fgState.goalpost.baseX;
            const baseY = fgState.goalpost.baseY;
            const postHeight = fgState.goalpost.postHeight * scale;
            const crossbarWidth = fgState.goalpost.crossbarWidth * scale;
            const uprightHeight = fgState.goalpost.uprightHeight * scale;
            
            // Yellow goalpost
            fgCtx.strokeStyle = '#ffcc00';
            fgCtx.lineWidth = 5 * scale;
            
            // Vertical post (from ground to crossbar) - SHORT
            fgCtx.beginPath();
            fgCtx.moveTo(baseX, baseY + postHeight);
            fgCtx.lineTo(baseX, baseY);
            fgCtx.stroke();
            
            // Crossbar (horizontal)
            fgCtx.beginPath();
            fgCtx.moveTo(baseX - crossbarWidth / 2, baseY);
            fgCtx.lineTo(baseX + crossbarWidth / 2, baseY);
            fgCtx.stroke();
            
            // Left upright - TALL
            fgCtx.beginPath();
            fgCtx.moveTo(baseX - crossbarWidth / 2, baseY);
            fgCtx.lineTo(baseX - crossbarWidth / 2, baseY - uprightHeight);
            fgCtx.stroke();
            
            // Right upright - TALL
            fgCtx.beginPath();
            fgCtx.moveTo(baseX + crossbarWidth / 2, baseY);
            fgCtx.lineTo(baseX + crossbarWidth / 2, baseY - uprightHeight);
            fgCtx.stroke();
        }
        
        function drawFootball() {
            const scale = fgState.ball.kicked ? Math.max(0.2, 1 - (fgState.ball.z / fgState.goalpost.z)) : 1;
            const radius = fgState.ball.radius * scale;
            
            fgCtx.save();
            fgCtx.translate(fgState.ball.x, fgState.ball.y);
            fgCtx.rotate(fgState.ball.rotation);
            
            // Draw football (brown)
            fgCtx.fillStyle = '#8b4513';
            fgCtx.beginPath();
            fgCtx.ellipse(0, 0, radius * 1.3, radius * 0.9, 0, 0, Math.PI * 2);
            fgCtx.fill();
            
            // Laces
            fgCtx.strokeStyle = '#ffffff';
            fgCtx.lineWidth = Math.max(1, 2 * scale);
            fgCtx.beginPath();
            fgCtx.moveTo(-radius * 0.6, 0);
            fgCtx.lineTo(radius * 0.6, 0);
            fgCtx.stroke();
            
            if (!fgState.ball.kicked) {
                for (let i = -2; i <= 2; i++) {
                    fgCtx.beginPath();
                    fgCtx.moveTo(i * 6, -4);
                    fgCtx.lineTo(i * 6, 4);
                    fgCtx.stroke();
                }
            }
            
            fgCtx.restore();
        }
        
        function drawScoreboard() {
            // Scoreboard background - centered
            const boardWidth = 120;
            const boardX = (fgCanvas.width - boardWidth) / 2;
            fgCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            fgCtx.fillRect(boardX, 10, boardWidth, 70);
            
            fgCtx.fillStyle = '#5a3d7a';
            fgCtx.font = 'bold 12px "Outfit", sans-serif';
            fgCtx.textAlign = 'center';
            
            // Away team
            fgCtx.fillText('AWAY', boardX + boardWidth / 2, 25);
            fgCtx.font = 'bold 20px "Outfit", sans-serif';
            fgCtx.fillText(awayScore.toString(), boardX + boardWidth / 2, 42);
            
            // Home team
            fgCtx.font = 'bold 12px "Outfit", sans-serif';
            fgCtx.fillText('HOME', boardX + boardWidth / 2, 57);
            fgCtx.font = 'bold 20px "Outfit", sans-serif';
            fgCtx.fillText(homeScore.toString(), boardX + boardWidth / 2, 74);
        }
        
        function drawFlickIndicator() {
            if (fgState.ball.flicking) {
                const dx = fgState.ball.x - fgState.dragStartX;
                const dy = fgState.ball.y - fgState.dragStartY;
                
                // Draw arrow showing flick direction
                fgCtx.strokeStyle = 'rgba(90, 61, 122, 0.6)';
                fgCtx.lineWidth = 3;
                fgCtx.setLineDash([5, 5]);
                fgCtx.beginPath();
                fgCtx.moveTo(fgState.dragStartX, fgState.dragStartY);
                fgCtx.lineTo(fgState.ball.x, fgState.ball.y);
                fgCtx.stroke();
                fgCtx.setLineDash([]);
                
                // Arrow head
                const angle = Math.atan2(dy, dx);
                const headLength = 15;
                fgCtx.beginPath();
                fgCtx.moveTo(fgState.ball.x, fgState.ball.y);
                fgCtx.lineTo(
                    fgState.ball.x - headLength * Math.cos(angle - Math.PI / 6),
                    fgState.ball.y - headLength * Math.sin(angle - Math.PI / 6)
                );
                fgCtx.moveTo(fgState.ball.x, fgState.ball.y);
                fgCtx.lineTo(
                    fgState.ball.x - headLength * Math.cos(angle + Math.PI / 6),
                    fgState.ball.y - headLength * Math.sin(angle + Math.PI / 6)
                );
                fgCtx.stroke();
            }
        }
        
        function checkFieldGoal() {
            // Check if ball is at goalpost depth - only check horizontal position between uprights
            if (fgState.ball.z >= fgState.goalpost.z && !fgState.ball.scored) {
                const scale = 0.6;
                const crossbarWidth = fgState.goalpost.crossbarWidth * scale;
                const leftPost = fgState.goalpost.baseX - crossbarWidth / 2;
                const rightPost = fgState.goalpost.baseX + crossbarWidth / 2;
                
                // Only check if between the uprights horizontally - height doesn't matter
                if (fgState.ball.x > leftPost && fgState.ball.x < rightPost) {
                    fgState.ball.scored = true;
                    homeScore += 3;
                    return true;
                }
            }
            return false;
        }
        
        function fgDraw() {
            fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
            
            // Background matching basketball game
            fgCtx.fillStyle = 'rgba(90, 61, 122, 0.05)';
            fgCtx.fillRect(0, 0, fgCanvas.width, fgCanvas.height);
            
            // Ground area
            fgCtx.fillStyle = 'rgba(90, 61, 122, 0.1)';
            fgCtx.fillRect(0, 450, fgCanvas.width, fgCanvas.height - 450);
            
            drawGoalpost();
            drawFlickIndicator();
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
                
                // Update rotation (spin)
                fgState.ball.rotation += 0.15;
                
                // Check for field goal
                checkFieldGoal();
                
                // Reset if ball goes too far or hits ground
                if (fgState.ball.z > fgState.goalpost.z + 100 || 
                    fgState.ball.y > 480 ||
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
            fgState.ball.rotation = Math.PI / 2;  // Reset to vertical
            fgState.ball.kicked = false;
            fgState.ball.flicking = false;
            fgState.ball.scored = false;
        }
        
        function fgGameLoop() {
            fgUpdatePhysics();
            fgDraw();
            requestAnimationFrame(fgGameLoop);
        }
        
        // Mouse events for field goal - flick mechanic
        fgCanvas.addEventListener('mousedown', (e) => {
            const rect = fgCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const dx = mouseX - fgState.ball.x;
            const dy = mouseY - fgState.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < fgState.ball.radius * 2 && !fgState.ball.kicked) {
                fgState.ball.flicking = true;
                fgState.dragStartX = mouseX;
                fgState.dragStartY = mouseY;
                fgState.dragStartTime = Date.now();
            }
        });
        
        fgCanvas.addEventListener('mousemove', (e) => {
            if (fgState.ball.flicking && !fgState.ball.kicked) {
                const rect = fgCanvas.getBoundingClientRect();
                fgState.ball.x = e.clientX - rect.left;
                fgState.ball.y = e.clientY - rect.top;
            }
        });
        
        fgCanvas.addEventListener('mouseup', (e) => {
            if (fgState.ball.flicking) {
                const rect = fgCanvas.getBoundingClientRect();
                const endX = e.clientX - rect.left;
                const endY = e.clientY - rect.top;
                const endTime = Date.now();
                
                // Calculate flick velocity based on distance and time
                const dx = endX - fgState.dragStartX;
                const dy = endY - fgState.dragStartY;
                const dt = Math.max(1, endTime - fgState.dragStartTime);
                
                const flickSpeed = Math.sqrt(dx * dx + dy * dy) / dt;
                const flickDistance = Math.sqrt(dx * dx + dy * dy);
                
                // Reset ball to starting position
                fgState.ball.x = fgState.ball.startX;
                fgState.ball.y = fgState.ball.startY;
                
                fgState.ball.flicking = false;
                fgState.ball.kicked = true;
                
                if (flickDistance > 5) {
                    // Velocity based on flick direction and speed
                    const angle = Math.atan2(dy, dx);
                    const power = Math.min(flickSpeed * 8, flickDistance * FG_FLICK_MULTIPLIER);
                    
                    fgState.ball.vx = Math.cos(angle) * power;
                    fgState.ball.vy = Math.sin(angle) * power;
                    fgState.ball.vz = power * 3;  // Forward velocity
                } else {
                    fgResetBall();
                }
            }
        });
        
        fgCanvas.addEventListener('mouseleave', () => {
            if (fgState.ball.flicking) {
                fgResetBall();
            }
        });
        
        // Start field goal game loop
        fgGameLoop();
    }
    
    // Project Modal Functionality
    const modal = document.getElementById('projectModal');
    const projectFrame = document.getElementById('projectFrame');
    const modalClose = document.querySelector('.modal-close');
    const projectCards = document.querySelectorAll('.project-card[data-project]');
    
    // Project file mapping
    const projectFiles = {
        'nfl': 'two-high-safeties.html'
        // Add more projects here as needed
    };
    
    // Open modal when clicking project card
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            const projectFile = projectFiles[projectId];
            
            if (projectFile) {
                projectFrame.src = projectFile;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        projectFrame.src = '';
        document.body.style.overflow = 'auto';
    }
    
    modalClose.addEventListener('click', closeModal);
    
    // Close when clicking outside modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
