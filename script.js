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
    
    // Work modal elements
    const workModal = document.getElementById('workModal');
    const workClose = document.querySelector('.work-close');
    const workItems = document.querySelectorAll('.project-item[data-work-project]');
    
    const projectFiles = {
        'nfl': 'articles/two-high-safety.html',
        'lillard': 'articles/lillard.html'
    };
    
    const workProjects = {
        'nfl-predictor': {
            title: 'NFL Play-Calling Predictor',
            description: 'I built a machine learning model that predicts offensive play calls in the NFL. I trained it with XGBoost on over 200,000 plays from nflfastR datasets spanning 2018-2023, classifying each play into six types based on game situation. I implemented custom sample weighting to emphasize high-leverage moments like two-minute drills and fourth downs, achieving around 52% accuracy on the 6-class prediction task. I deployed it as an interactive Streamlit dashboard where you can input game state, personnel, and clock information to see probability distributions across all play types.',
            github: 'https://github.com/jisungl/NFL-Play-Predictor'
        },
        'linked': {
            title: 'Linked',
            description: 'I built this Android app for Sunday Study Room, my tutoring organization, to manage weekly attendance and automate tutor-student matching. Students can request attendance through a calendar view, tutors see their assigned students, and I built an admin interface where admins assign students to tutors using dropdowns that update in real time. I used MVVM architecture with Kotlin ViewModels, LiveData, and coroutines for reactive UI updates. I chose Azure Blob Storage as the backend, storing user accounts and session data as JSON blobs. I implemented role-based routing that navigates users to different views based on their account type.',
            github: 'https://github.com/jisungl/Linked'
        },
        'folio': {
            title: 'Folio',
            description: 'This is my portfolio website. I built it with vanilla HTML, CSS, and JavaScript, featuring smooth animations, modal-based content delivery, and URL-based deep linking with history.pushState. I created an animated bubble indicator that tracks the active page using cubic-bezier easing. I embedded my articles in iframe modals with responsive formatting, and each has an associated notes modal with background context. I also built a canvas-based basketball shooting game with drag-to-aim mechanics, projectile physics (gravity, bounce damping), rim and backboard collision detection, and real-time score tracking.',
            github: 'https://github.com/jisungl/jisungl.github.io'
        },
        'flights-app': {
            title: 'Flights App',
            description: 'I built a console-based flight booking system with Java and PostgreSQL. Users can create accounts, search for direct and multi-leg itineraries sorted by duration, book flights with seat capacity enforcement, and pay for reservations from an account balance. I implemented search queries using multi-table joins across Flights, Aircraft_Types, and N_Numbers to retrieve seat capacity alongside flight details. I wrapped booking logic inside manual transactions that check for same-day conflicts, verify capacity by counting existing reservations, and atomically insert itinerary and reservation records with rollback on failure. For authentication, I used PBKDF2 with HMAC-SHA1 for password hashing with per-user salts.',
            github: 'https://github.com/jisungl/Flights-App'
        },
        'web-search': {
            title: 'Web Search Engine',
            description: 'I built a multithreaded HTTP web server with integrated full-text search, written in C and C++. The system crawls a directory of documents, builds an inverted index mapping every word to the documents and positions where it appears, and serializes it to a custom binary format with checksums. I implemented the server to bind to a TCP socket and dispatch connections to 8 worker threads via a synchronized task queue built on pthreads. Requests route to either static file serving or search query processing, with results ranked and returned as HTML. I added support for graceful shutdown, persistent HTTP connections, and HTML escaping to prevent XSS.',
            github: 'https://github.com/jisungl/Web-Search-Engine'
        }
    };
    
    let currentModalUrl = null;
    let originalUrl = null;
    
    const urlToProject = {
        'are-two-high-safeties-ruining-the-nfl': 'nfl',
        'just-how-good-was-damian-lillard': 'lillard'
    };
    
    const urlToWorkProject = {
        'nfl-play-predictor': 'nfl-predictor',
        'linked': 'linked',
        'folio': 'folio',
        'flights-app': 'flights-app',
        'web-search-engine': 'web-search'
    };
    
    function getBasePath() {
        const pathParts = window.location.pathname.split('/').filter(p => p);
        let basePath = '';
        for (let i = 0; i < pathParts.length; i++) {
            basePath += '../';
        }
        return basePath;
    }
    
    function getPageFromPath(path) {
        if (path.includes('/about')) return 'about';
        if (path.includes('/projects')) return 'projects';
        if (path.includes('/contact')) return 'contact';
        return 'home';
    }
    
    function initBubblePosition() {
        const referrer = document.referrer;
        const currentPage = getPageFromPath(window.location.pathname);
        const previousPage = getPageFromPath(referrer);
        
        const isSameSite = referrer.includes(window.location.hostname) || referrer === '';
        
        if (isSameSite && previousPage !== currentPage) {
            const links = document.querySelectorAll('.nav-link');
            let previousLink = null;
            let currentLink = null;
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (previousPage === 'home' && (href === './' || href === '../')) {
                    previousLink = link;
                }
                if (previousPage === 'about' && href.includes('about')) {
                    previousLink = link;
                }
                if (previousPage === 'projects' && href.includes('projects')) {
                    previousLink = link;
                }
                if (previousPage === 'contact' && href.includes('contact')) {
                    previousLink = link;
                }
                
                if (link.classList.contains('active')) {
                    currentLink = link;
                }
            });
            
            if (previousLink) {
                const prevRect = previousLink.getBoundingClientRect();
                const navRect = document.querySelector('.nav-container').getBoundingClientRect();
                
                navBubble.style.transition = 'none';
                navBubble.style.width = prevRect.width + 'px';
                navBubble.style.height = prevRect.height + 'px';
                navBubble.style.left = (prevRect.left - navRect.left) + 'px';
                navBubble.style.top = (prevRect.top - navRect.top) + 'px';
                
                navBubble.offsetHeight;
                
                navBubble.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        }
        
        updateBubblePosition();
    }
    
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
    
    initBubblePosition();
    
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
    
    function checkUrlAndOpenModal() {
        const path = window.location.pathname;
        
        for (const [urlSlug, workId] of Object.entries(urlToWorkProject)) {
            if (path.includes(`/projects/${urlSlug}`)) {
                openWorkModal(workId, urlSlug);
                return;
            }
        }
        
        for (const [urlSlug, projectId] of Object.entries(urlToProject)) {
            if (path.includes(`/${urlSlug}/notes`)) {
                openNotesModal(projectId, urlSlug);
                return;
            }
            if (path.includes(`/${urlSlug}`)) {
                openProjectModal(projectId, urlSlug);
                return;
            }
        }
    }
    
    function openProjectModal(projectId, urlSlug, updateUrl = false) {
        const projectFile = projectFiles[projectId];
        if (projectFile) {
            const basePath = getBasePath();
            projectFrame.src = basePath + projectFile;
            
            projectFrame.onload = function() {
                try {
                    const iframeDoc = projectFrame.contentDocument || projectFrame.contentWindow.document;
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        /* Article text - dark teal */
                        body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6 {
                            color: #025A4E !important;
                        }
                        
                        /* Regular links - bold dark teal */
                        a {
                            color: #025A4E !important;
                            font-weight: bold !important;
                        }
                        
                        /* "View Original Article →" button at top - styled like GitHub button */
                        a.original-link-btn {
                            display: inline-flex !important;
                            align-items: center !important;
                            gap: 10px !important;
                            padding: 12px 24px !important;
                            background: #025A4E !important;
                            color: white !important;
                            text-decoration: none !important;
                            border-radius: 8px !important;
                            font-weight: 500 !important;
                            transition: background 0.2s ease !important;
                            box-shadow: none !important;
                            animation: none !important;
                        }
                        
                        a.original-link-btn:hover {
                            background: #013d34 !important;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                } catch (e) {
                    console.log('Could not inject styles:', e);
                }
            };
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (updateUrl) {
                originalUrl = window.location.pathname;
                const isProjectsPage = window.location.pathname.includes('/projects/');
                const newUrl = isProjectsPage ? `/projects/${urlSlug}/` : `/${urlSlug}/`;
                history.pushState({ modal: 'project', projectId: projectId }, '', newUrl);
                currentModalUrl = newUrl;
            }
        }
    }
    
    function openNotesModal(notesType, urlSlug, updateUrl = false) {
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
        
        if (updateUrl) {
            originalUrl = window.location.pathname;
            const isProjectsPage = window.location.pathname.includes('/projects/');
            const newUrl = isProjectsPage ? `/projects/${urlSlug}/notes/` : `/${urlSlug}/notes/`;
            history.pushState({ modal: 'notes', notesType: notesType }, '', newUrl);
            currentModalUrl = newUrl;
        }
    }
    
    function openWorkModal(workId, urlSlug, updateUrl = false) {
        const project = workProjects[workId];
        if (project) {
            const workTitle = document.querySelector('.work-title');
            const workDescription = document.querySelector('.work-description');
            const githubLink = document.querySelector('.github-link');
            
            workTitle.textContent = project.title;
            workDescription.textContent = project.description;
            githubLink.href = project.github;
            
            workModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (updateUrl) {
                originalUrl = window.location.pathname;
                const newUrl = `/projects/${urlSlug}/`;
                history.pushState({ modal: 'work', workId: workId }, '', newUrl);
                currentModalUrl = newUrl;
            }
        }
    }
    
    function closeWorkModal() {
        workModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        if (currentModalUrl && originalUrl) {
            history.pushState(null, '', originalUrl);
            currentModalUrl = null;
            originalUrl = null;
        }
    }
    
    checkUrlAndOpenModal();
    
    projectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.notepad-icon')) return;
            
            const projectId = this.getAttribute('data-project');
            const urlPath = this.getAttribute('data-url');
            
            openProjectModal(projectId, urlPath, true);
        });
    });
    
    notepadIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const notesType = this.getAttribute('data-notes');
            const urlPath = this.getAttribute('data-url');
            
            openNotesModal(notesType, urlPath, true);
        });
    });
    
    workItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const workId = this.getAttribute('data-work-project');
            const urlPath = this.getAttribute('data-work-url');
            
            openWorkModal(workId, urlPath, true);
        });
    });
    
    function closeModal() {
        modal.classList.remove('active');
        projectFrame.src = '';
        document.body.style.overflow = 'auto';
        
        if (currentModalUrl && originalUrl) {
            history.pushState(null, '', originalUrl);
            currentModalUrl = null;
            originalUrl = null;
        }
    }
    
    function closeNotesModal() {
        notesModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        if (currentModalUrl && originalUrl) {
            history.pushState(null, '', originalUrl);
            currentModalUrl = null;
            originalUrl = null;
        }
    }
    
    window.addEventListener('popstate', function(e) {
        if (modal.classList.contains('active')) {
            closeModal();
        }
        if (notesModal.classList.contains('active')) {
            closeNotesModal();
        }
        if (workModal.classList.contains('active')) {
            closeWorkModal();
        }
    });
    
    modalClose.addEventListener('click', closeModal);
    notesClose.addEventListener('click', closeNotesModal);
    workClose.addEventListener('click', closeWorkModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    notesModal.addEventListener('click', function(e) {
        if (e.target === notesModal) closeNotesModal();
    });
    
    workModal.addEventListener('click', function(e) {
        if (e.target === workModal) closeWorkModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            }
            if (notesModal.classList.contains('active')) {
                closeNotesModal();
            }
            if (workModal.classList.contains('active')) {
                closeWorkModal();
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
            ball: { x: 144, y: 468, startX: 144, startY: 468, radius: 14, vx: 0, vy: 0, dragging: false, shot: false, scored: false },
            player: { x: 96, y: 504 },
            hoop: { x: 504, y: 432, rimRadius: 36, backboardX: 540 },
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
                let vx = 0, vy = 0;
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
                let px = gameState.ball.startX, py = gameState.ball.startY, pvx = vx, pvy = vy;
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
            if (Math.abs(gameState.ball.x - leftRim) < gameState.ball.radius && Math.abs(gameState.ball.y - rimY) < gameState.ball.radius) {
                gameState.ball.vx = -Math.abs(gameState.ball.vx) * BOUNCE_DAMPING;
                gameState.ball.vy *= BOUNCE_DAMPING;
                return true;
            }
            if (Math.abs(gameState.ball.x - rightRim) < gameState.ball.radius && Math.abs(gameState.ball.y - rimY) < gameState.ball.radius) {
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
            if (gameState.ball.x + gameState.ball.radius >= backboardX && gameState.ball.y >= backboardTop && gameState.ball.y <= backboardBottom && gameState.ball.vx > 0) {
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
            return gameState.ball.x > leftRim + gameState.ball.radius && gameState.ball.x < rightRim - gameState.ball.radius && ballTop <= hoopY && ballBottom >= hoopY && gameState.ball.vy > 0;
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
                if (gameState.ball.y > canvas.height + 50 || gameState.ball.x < -50 || gameState.ball.x > canvas.width + 50 || gameState.ball.y < -50) {
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
