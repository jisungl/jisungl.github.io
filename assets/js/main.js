(function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.pathname) {
        history.replaceState(null, null, redirect);
    }
})();

const projectData = {
    'nfl-predictor': {
        title: 'NFL Play-Calling<br>Predictor',
        description: 'This machine learning model predicts offensive play calls in the NFL. Working with six years of NFL play-by-play data, I engineered over 60 features that cover game state, personnel groupings, and formation, weighted to reflect my own understanding of the sport. I regularization to increase the weight of time-constrained situations, achieving around 62% accuracy on the 6-class prediction task. I deployed it as an interactive Streamlit dashboard where you can input game state, personnel, and clock information to see probability distributions across all play types.',
        github: 'https://github.com/jisungl/NFL-Play-Predictor'
    },
    'linked': {
        title: 'Linked',
        description: 'I built this Android app for Sunday Study Room, my tutoring organization, to manage weekly attendance and automate tutor-student matching. Students can request attendance through a calendar view, tutors see their assigned students, and I built an admin interface where admins assign students to tutors. I used MVVM architecture with Kotlin ViewModels, LiveData, and coroutines for reactive UI updates. I chose Azure Blob Storage as the backend, storing user accounts and session data as JSON blobs.',
        github: 'https://github.com/jisungl/Linked'
    },
    'folio': {
        title: 'Folio',
        description: 'This very website. I built it with HTML, CSS, and JavaScript. My technical projects are listed, and I embedded my articles in iframe modals, and each has an associated notes modal with background context. Take a look around!',
        github: 'https://github.com/jisungl/jisungl.github.io'
    },
    'flights-app': {
        title: 'Flights App',
        description: 'I built a flight booking system with Java and PostgreSQL. Users can create accounts, search for direct and multi-leg itineraries sorted by duration, book flights with seat capacity enforcement, and pay for reservations from an account balance. I implemented search queries using multi-table joins across Flights, Aircraft_Types, and N_Numbers to retrieve seat capacity alongside flight details. For authentication, I used PBKDF2 with HMAC-SHA1 for password hashing with per-user salts.',
        github: 'https://github.com/jisungl/Flights-App'
    },
    'web-search': {
        title: 'Web Search Engine',
        description: 'I built a multithreaded HTTP web server with full-text search, written in C and C++. The system runs on a directory of documents, builds an inverted index mapping every word to the documents and positions where it appears, and serializes it to a custom binary format with checksums. I implemented the server to bind to a TCP socket and dispatch connections to 8 worker threads via a synchronized task queue built on pthreads. Requests route to either static file serving or search query processing, with results ranked and returned as HTML.',
        github: 'https://github.com/jisungl/Web-Search-Engine'
    }
};

const articleData = {
    'two-high': {
        path: '/articles/two-high-safety.html',
        notes: '/articles/two-high-notes.html'
    },
    'lillard': {
        path: '/articles/lillard.html',
        notes: null
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const siteHeader = document.querySelector('.siteHeader');
    const content = document.querySelector('.content');
    const navLinks = document.querySelectorAll('.siteHeader_nav a');
    const navItems = document.querySelectorAll('.siteHeader_nav li');
    
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            history.pushState(null, '', '/' + targetPage);
            loadPageFromPath();
        });
    });
    
    const lightBtn = document.getElementById('light-btn');
    const darkBtn = document.getElementById('dark-btn');
    
    lightBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'light');
        lightBtn.classList.add('is-selected');
        darkBtn.classList.remove('is-selected');
    });
    
    darkBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkBtn.classList.add('is-selected');
        lightBtn.classList.remove('is-selected');
    });
    
    const projectItems = document.querySelectorAll('.project_item[data-project]');
    projectItems.forEach(item => {
        item.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            history.pushState(null, '', `/projects/${projectId}`);
            loadPageFromPath();
        });
    });
    
    function doOpenProjectDetail(projectId) {
        const project = projectData[projectId];
        if (!project) return;
        
        const detailPage = document.querySelector('[data-page-section="project-detail"]');
        const detailTitle = detailPage.querySelector('.project-detail_title');
        const detailGithub = detailPage.querySelector('.project-detail_github');
        const detailDesc = detailPage.querySelector('.project-detail_description');
        
        detailTitle.innerHTML = project.title;
        detailGithub.href = project.github;
        detailDesc.textContent = project.description;
        
        const projectsPage = document.querySelector('[data-page-section="projects"]');
        projectsPage.style.opacity = '0';
        
        setTimeout(() => {
            projectsPage.classList.remove('is-active');
            projectsPage.style.opacity = '1';
            
            detailPage.style.opacity = '0';
            detailPage.classList.add('is-active');
            detailPage.offsetHeight;
            detailPage.style.opacity = '1';
        }, 300);
    }
    
    const projectDetailClose = document.querySelector('[data-page-section="project-detail"] .project-detail_close');
    if (projectDetailClose) {
        projectDetailClose.addEventListener('click', function() {
            history.pushState(null, '', '/projects');
            loadPageFromPath();
        });
    }
    
    const articleItems = document.querySelectorAll('.project_item[data-article]');
    articleItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('notes-link')) {
                return;
            }
            const articleId = this.getAttribute('data-article');
            history.pushState(null, '', `/analysis/${articleId}`);
            loadPageFromPath();
        });
    });
    
    function doOpenArticleView(articleId) {
        const article = articleData[articleId];
        if (!article) return;
        
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        const articleFrame = articleViewPage.querySelector('.article-view_frame');
        
        articleFrame.src = article.path;
        
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        siteHeader.classList.add('hidden');
        content.classList.add('hidden');
        
        setTimeout(() => {
            analysisPage.classList.remove('is-active');
            
            articleViewPage.style.opacity = '0';
            articleViewPage.classList.add('is-active');
            articleViewPage.offsetHeight;
            articleViewPage.style.opacity = '1';
        }, 300);
    }
    
    function doCloseArticleView() {
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        const articleFrame = articleViewPage.querySelector('.article-view_frame');
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        navLinks.forEach((link, index) => {
            if (link.getAttribute('data-page') === 'analysis') {
                navItems.forEach(item => item.classList.remove('is-selected'));
                navItems[index].classList.add('is-selected');
            }
        });
        
        articleViewPage.style.opacity = '0';
        
        setTimeout(() => {
            articleViewPage.classList.remove('is-active');
            articleFrame.src = '';
            articleViewPage.style.opacity = '1';
            
            siteHeader.classList.remove('hidden');
            content.classList.remove('hidden');
            
            analysisPage.style.opacity = '0';
            analysisPage.classList.add('is-active');
            analysisPage.offsetHeight;
            analysisPage.style.opacity = '1';
        }, 300);
    }
    
    const articleViewClose = document.querySelector('.article-view_close');
    if (articleViewClose) {
        articleViewClose.addEventListener('click', function() {
            history.pushState(null, '', '/analysis');
            loadPageFromPath();
        });
    }
    
    const notesLinks = document.querySelectorAll('.notes-link');
    notesLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const articleId = this.getAttribute('data-notes');
            history.pushState(null, '', `/analysis/${articleId}/notes`);
            loadPageFromPath();
        });
    });
    
    function doOpenNotesView(articleId) {
        const article = articleData[articleId];
        if (!article || !article.notes) return;
        
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        const notesFrame = notesViewPage.querySelector('.notes-view_frame');
        
        notesFrame.src = article.notes;
        
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        content.classList.add('hidden');
        
        setTimeout(() => {
            analysisPage.classList.remove('is-active');
            
            notesViewPage.style.opacity = '0';
            notesViewPage.classList.add('is-active');
            notesViewPage.offsetHeight;
            notesViewPage.style.opacity = '1';
        }, 300);
    }
    
    function doCloseNotesView() {
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        const notesFrame = notesViewPage.querySelector('.notes-view_frame');
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        navLinks.forEach((link, index) => {
            if (link.getAttribute('data-page') === 'analysis') {
                navItems.forEach(item => item.classList.remove('is-selected'));
                navItems[index].classList.add('is-selected');
            }
        });
        
        notesViewPage.style.opacity = '0';
        
        setTimeout(() => {
            notesViewPage.classList.remove('is-active');
            notesFrame.src = '';
            notesViewPage.style.opacity = '1';
            
            content.classList.remove('hidden');
            
            analysisPage.style.opacity = '0';
            analysisPage.classList.add('is-active');
            analysisPage.offsetHeight;
            analysisPage.style.opacity = '1';
        }, 300);
    }
    
    const notesViewClose = document.querySelector('.notes-view_close');
    if (notesViewClose) {
        notesViewClose.addEventListener('click', function() {
            history.pushState(null, '', '/analysis');
            loadPageFromPath();
        });
    }
    
    function loadPageFromPath() {
        let path = window.location.pathname;
        
        path = path.replace(/^\//, '').replace(/\/$/, '');
        
        if (!path || path === '' || path === 'index.html' || path === 'home') {
            const homePage = document.querySelector('[data-page-section="home"]');
            if (!homePage.classList.contains('is-active')) {
                navigateToPage('home');
            }
            return;
        }
        
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        
        if (path === 'analysis') {
            if (articleViewPage.classList.contains('is-active')) {
                doCloseArticleView();
                return;
            }
            if (notesViewPage.classList.contains('is-active')) {
                doCloseNotesView();
                return;
            }
        }
        
        if (path.startsWith('projects/')) {
            const projectId = path.split('/')[1];
            if (projectData[projectId]) {
                const projectsPage = document.querySelector('[data-page-section="projects"]');
                const detailPage = document.querySelector('[data-page-section="project-detail"]');
                
                if (!projectsPage.classList.contains('is-active') && !detailPage.classList.contains('is-active')) {
                    navigateToPage('projects');
                    setTimeout(() => doOpenProjectDetail(projectId), 350);
                } else if (projectsPage.classList.contains('is-active')) {
                    doOpenProjectDetail(projectId);
                }
                return;
            }
        }
        
        if (path.startsWith('analysis/')) {
            const parts = path.split('/');
            const articleId = parts[1];
            const isNotes = parts[2] === 'notes';
            
            if (articleData[articleId]) {
                const analysisPage = document.querySelector('[data-page-section="analysis"]');
                
                if (!analysisPage.classList.contains('is-active') && !articleViewPage.classList.contains('is-active') && !notesViewPage.classList.contains('is-active')) {
                    navigateToPage('analysis');
                    setTimeout(() => {
                        if (isNotes) {
                            doOpenNotesView(articleId);
                        } else {
                            doOpenArticleView(articleId);
                        }
                    }, 350);
                } else if (analysisPage.classList.contains('is-active')) {
                    if (isNotes) {
                        doOpenNotesView(articleId);
                    } else {
                        doOpenArticleView(articleId);
                    }
                }
                return;
            }
        }
        
        const targetPage = document.querySelector(`[data-page-section="${path}"]`);
        if (targetPage && !targetPage.classList.contains('is-active')) {
            navigateToPage(path);
        }
    }
    
    function navigateToPage(pageName) {
        navLinks.forEach((link, index) => {
            if (link.getAttribute('data-page') === pageName) {
                navItems.forEach(item => item.classList.remove('is-selected'));
                navItems[index].classList.add('is-selected');
            }
        });
        
        const currentPage = document.querySelector('.page.is-active');
        if (currentPage) {
            currentPage.style.opacity = '0';
            
            setTimeout(() => {
                currentPage.classList.remove('is-active');
                currentPage.style.opacity = '1';
                
                const newPage = document.querySelector(`[data-page-section="${pageName}"]`);
                if (newPage) {
                    newPage.style.opacity = '0';
                    newPage.classList.add('is-active');
                    newPage.offsetHeight;
                    newPage.style.opacity = '1';
                }
            }, 300);
        }
    }
    
    loadPageFromPath();
    
    window.addEventListener('popstate', loadPageFromPath);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const projectDetailPage = document.querySelector('[data-page-section="project-detail"]');
            const articleViewPage = document.querySelector('[data-page-section="article-view"]');
            const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
            
            if (projectDetailPage.classList.contains('is-active')) {
                history.pushState(null, '', '/projects');
                loadPageFromPath();
                return;
            }
            
            if (articleViewPage.classList.contains('is-active')) {
                history.pushState(null, '', '/analysis');
                loadPageFromPath();
                return;
            }
            
            if (notesViewPage.classList.contains('is-active')) {
                history.pushState(null, '', '/analysis');
                loadPageFromPath();
                return;
            }
        }
    });
});
