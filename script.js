document.addEventListener('DOMContentLoaded', function() {
    const navBubble = document.querySelector('.nav-bubble');
    const navbar = document.getElementById('navbar');
    const modal = document.getElementById('projectModal');
    const projectFrame = document.getElementById('projectFrame');
    const modalClose = document.querySelector('.modal-close');
    const projectItems = document.querySelectorAll('.project-item[data-project]');
    
    const notesModal = document.getElementById('notesModal');
    const notesClose = document.querySelector('.notes-close');
    const notepadIcons = document.querySelectorAll('.notepad-icon');
    
    const projectFiles = {
        'nfl': 'two-high-safety.html',
        'lillard': 'lillard.html'
    };
    
    let currentModalUrl = null;
    
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
    
    updateBubblePosition();
    
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            updateBubblePosition();
        }, 10);
    });
    
    window.addEventListener('resize', updateBubblePosition);
    
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
    
    projectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.notepad-icon')) return;
            
            const projectId = this.getAttribute('data-project');
            const urlPath = this.getAttribute('data-url');
            const projectFile = projectFiles[projectId];
            
            if (projectFile) {
                const basePath = window.location.pathname.includes('/projects/') ? '../' : '';
                projectFrame.src = basePath + projectFile;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                if (urlPath) {
                    const newUrl = '/' + urlPath + '/';
                    history.pushState({ modal: 'project', projectId: projectId }, '', newUrl);
                    currentModalUrl = newUrl;
                }
            }
        });
    });
    
    notepadIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const notesType = this.getAttribute('data-notes');
            const urlPath = this.getAttribute('data-url');
            const notesContent = document.querySelector('.notes-content');
            const notesTitle = document.querySelector('.notes-title');
            
            if (notesType === 'lillard') {
                notesTitle.textContent = 'Coming Soon';
                notesContent.innerHTML = '<p style="text-align: center; font-size: 1.2rem; padding: 40px;"></p>';
            } else if (notesType === 'nfl') {
                notesTitle.textContent = 'Notes';
                notesContent.innerHTML = `
                    <p>During the early part of the 2024 NFL season, Mel Kiper, one of ESPN's most decorated football analysts, claimed one of the most polarizing takes of the year: two-high defenses should be banned in the NFL.</p>
                    
                    <div class="video-embed">
                        <iframe src="https://www.youtube.com/embed/rol91qAC0WY" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    
                    <p>It's a long video, but in short, it shows Kiper stating that the two-high safety defenses ruin the football viewing experience. This was a narrative relatively well-known and believed, although controversial. It involves the belief that because defensive coordinators are dropping two deep safeties into deep coverage so often, explosive pass plays were hard to come by, making games boring to watch.</p>
                    
                    <p>This claim misrepresents football. The sport provides viewing experiences of all shapes, including ones with masterclass defense battles and clever offensive schemes that take advantage of minute holes in a defense — it's an art.</p>
                    
                    <p>Out of curiosity, I researched around this topic and found a basis and ample data to challenge this take through data visualizations that tell an opposing story. Particularly, <a href="https://www.youtube.com/@BrettKollmann" target="_blank">Brett Kollman's</a> video, <a href="https://www.youtube.com/watch?v=fGRkKmXGZr8" target="_blank"><i>"Two high safeties are ruining football"</i></a>, on this topic was the driving inspiration for my project.</p>
                    
                    <p>The key misconception, as explained in my article, is that people notice the popularization of the pre-snap two-high look and falsely correlate it with an increase in actual two-high safety defenses.</p>
                    
                    <p>In reality, over the last decade, the rate at which defenses in the NFL run a two-high safety defense has remained consistent. The difference is that coordinators have started disguising their coverage by <strong>rotating</strong> their safeties from a pre-snap position to a post-snap coverage.</p>
                    
                    <p>I found that this is encouraged especially alongside the decreasing trend of safety archetypes: rotations were less common when there were defined free safeties (Earl Thomas) that roamed over the top and strong safeties (Roy Williams) who flourished in the box. Now, with more versatile, hybrid safeties like Kyle Hamilton, there is no true "assignment" for safeties. When either safety can play in the box or roam over the top, rotations become easier to pull off, as defenses don't have to compromise player strengths and leave vulnerabilities on the coverage.</p>
                    <p>I wrote this educational article inclusively for an audience that may not be familiar with the game of football in an attempt to explain a relatively complex concept in football to new fans, although I will probably never do that again, considering how difficult it is to explain complicated football talk in casual language. This is my first true sports-related coding project, inspired by my curiosity and passion for football. I find it bad taste to discourage one of the most subtly satisfying aspects of the game</p>
                    
                    <p>At the end of the day, this increasingly advanced, complex idea of playing defense is beautiful to watch in full view. When executed properly, it forces an offense to be smarter with the football and makes the already offense-dominated sport slightly less offensive. In Kollman's words, if you don't like defensive football, then I can't help you.</p>
                `;
            }
            
            notesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (urlPath) {
                const newUrl = '/' + urlPath + '/';
                history.pushState({ modal: 'notes', notesType: notesType }, '', newUrl);
                currentModalUrl = newUrl;
            }
        });
    });
    
    function closeModal() {
        modal.classList.remove('active');
        projectFrame.src = '';
        document.body.style.overflow = 'auto';
        
        if (currentModalUrl) {
            history.pushState(null, '', window.location.pathname.split('/').slice(0, -2).join('/') + '/');
            currentModalUrl = null;
        }
    }
    
    function closeNotesModal() {
        notesModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        if (currentModalUrl) {
            history.pushState(null, '', window.location.pathname.split('/').slice(0, -2).join('/') + '/');
            currentModalUrl = null;
        }
    }
    
    window.addEventListener('popstate', function(e) {
        if (modal.classList.contains('active')) {
            closeModal();
        }
        if (notesModal.classList.contains('active')) {
            closeNotesModal();
        }
    });
    
    modalClose.addEventListener('click', closeModal);
    notesClose.addEventListener('click', closeNotesModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    notesModal.addEventListener('click', function(e) {
        if (e.target === notesModal) closeNotesModal();
    });
    
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
    
    // Basketball game
    function initBasketballGame(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let makes = 0;
        let attempts = 0;
        
        let gameState = {
            ball: {
                x: 144,
                y: 468,
                startX: 144,
                startY: 468,
                radius: 14,
                vx: 0,
                vy: 0,
                dragging: false,
                shot: false,
                scored: false
            },
            player: {
                x: 96,
                y: 504
            },
            hoop: {
                x: 504,
                y: 432,
                rimRadius: 36,
                backboardX: 540
            },
            ground: 540
        };
        
        const GRAVITY = 0.35;
        const LAUNCH_MULTIPLIER = 0.18;
        const BOUNCE_DAMPING = 0.6;
        
        function drawPlayer() {
            const y = gameState.ground;
            ctx.fillStyle = '#5a3d7a';
            ctx.strokeStyle = '#5a3d7a';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.arc(gameState.player.x, y - 60, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 48);
            ctx.lineTo(gameState.player.x, y - 12);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 42);
            ctx.lineTo(gameState.player.x + 22, y - 30);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, y - 42);
            ctx.lineTo(gameState.player.x - 22, y - 30);
            ctx.stroke();
            
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
            ctx.fillStyle = '#5a3d7a';
            ctx.fillRect(gameState.hoop.backboardX, gameState.hoop.y - 48, 7, 60);
            
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.lineTo(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y);
            ctx.stroke();
            
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(gameState.hoop.x - gameState.hoop.rimRadius, gameState.hoop.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(gameState.hoop.x + gameState.hoop.rimRadius, gameState.hoop.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
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
            const boxWidth = 132;
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
            ctx.fillStyle = '#ff8c42';
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        function drawTrajectoryPreview() {
            if (gameState.ball.dragging) {
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
                
                ctx.strokeStyle = 'rgba(90, 61, 122, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(gameState.ball.startX, gameState.ball.startY);
                
                let px = gameState.ball.startX;
                let py = gameState.ball.startY;
                let pvx = vx;
                let pvy = vy;
                
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
            
            if (Math.abs(gameState.ball.x - leftRim) < gameState.ball.radius &&
                Math.abs(gameState.ball.y - rimY) < gameState.ball.radius) {
                gameState.ball.vx = -Math.abs(gameState.ball.vx) * BOUNCE_DAMPING;
                gameState.ball.vy *= BOUNCE_DAMPING;
                return true;
            }
            
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
                gameState.ball.vy += GRAVITY;
                gameState.ball.x += gameState.ball.vx;
                gameState.ball.y += gameState.ball.vy;
                
                checkBackboardCollision();
                checkRimCollision();
                
                if (checkScore() && !gameState.ball.scored) {
                    gameState.ball.scored = true;
                    makes++;
                }
                
                if (gameState.ball.y + gameState.ball.radius >= gameState.ground) {
                    gameState.ball.y = gameState.ground - gameState.ball.radius;
                    gameState.ball.vy = -gameState.ball.vy * 0.5;
                    gameState.ball.vx *= 0.8;
                    
                    if (Math.abs(gameState.ball.vy) < 1) {
                        resetBall();
                    }
                }
                
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
                const dragX = gameState.ball.x - gameState.ball.startX;
                const dragY = gameState.ball.y - gameState.ball.startY;
                const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
                
                gameState.ball.x = gameState.ball.startX;
                gameState.ball.y = gameState.ball.startY;
                
                gameState.ball.dragging = false;
                gameState.ball.shot = true;
                attempts++;
                
                if (dragDistance > 0) {
                    const dirX = dragX / dragDistance;
                    const dirY = dragY / dragDistance;
                    
                    const power = dragDistance * LAUNCH_MULTIPLIER;
                    gameState.ball.vx = -dirX * power;
                    gameState.ball.vy = -dirY * power;
                } else {
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
        
        gameLoop();
    }
    
    initBasketballGame('basketballGameProjects');
});