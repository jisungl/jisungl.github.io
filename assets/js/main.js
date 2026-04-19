(function() {
    const redirect = sessionStorage.redirect;
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

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const siteHeader = document.querySelector('.siteHeader');
    const content = document.querySelector('.content');
    const navLinks = document.querySelectorAll('.siteHeader_nav a');
    const navItems = document.querySelectorAll('.siteHeader_nav li');
    const photoView = document.querySelector('.photo-view');
    const photoViewImage = document.querySelector('.photo-view_image');
    
    // Navigation
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            history.pushState(null, '', '/' + link.getAttribute('data-page'));
            loadPageFromPath();
        });
    });
    
    // Theme toggle
    const toggleTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('light-btn').classList.toggle('is-selected', theme === 'light');
        document.getElementById('dark-btn').classList.toggle('is-selected', theme === 'dark');
    };
    
    document.getElementById('light-btn').addEventListener('click', () => toggleTheme('light'));
    document.getElementById('dark-btn').addEventListener('click', () => toggleTheme('dark'));
    
    // Project items
    document.querySelectorAll('.project_item[data-project]').forEach(item => {
        item.addEventListener('click', () => {
            history.pushState(null, '', `/projects/${item.getAttribute('data-project')}`);
            loadPageFromPath();
        });
    });
    
    // Project detail
    const openProjectDetail = (projectId) => {
        const project = projectData[projectId];
        if (!project) return;
        
        const detailPage = document.querySelector('[data-page-section="project-detail"]');
        detailPage.querySelector('.project-detail_title').innerHTML = project.title;
        detailPage.querySelector('.project-detail_github').href = project.github;
        detailPage.querySelector('.project-detail_description').textContent = project.description;
        
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
    };
    
    document.querySelector('.project-detail_close')?.addEventListener('click', () => {
        history.pushState(null, '', '/projects');
        loadPageFromPath();
    });
    
    // Article items
    document.querySelectorAll('.project_item[data-article]').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notes-link')) {
                history.pushState(null, '', `/analysis/${item.getAttribute('data-article')}`);
                loadPageFromPath();
            }
        });
    });
    
    const updateNavSelection = (pageName) => {
        navLinks.forEach((link, index) => {
            if (link.getAttribute('data-page') === pageName) {
                navItems.forEach(item => item.classList.remove('is-selected'));
                navItems[index].classList.add('is-selected');
            }
        });
    };
    
    // Article view
    const openArticleView = (articleId) => {
        const article = articleData[articleId];
        if (!article) return;
        
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        articleViewPage.querySelector('.article-view_frame').src = article.path;
        
        siteHeader.classList.add('hidden');
        content.classList.add('hidden');
        
        setTimeout(() => {
            document.querySelector('[data-page-section="analysis"]').classList.remove('is-active');
            articleViewPage.style.opacity = '0';
            articleViewPage.classList.add('is-active');
            articleViewPage.offsetHeight;
            articleViewPage.style.opacity = '1';
        }, 300);
    };
    
    const closeArticleView = () => {
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        updateNavSelection('analysis');
        articleViewPage.style.opacity = '0';
        
        setTimeout(() => {
            articleViewPage.classList.remove('is-active');
            articleViewPage.querySelector('.article-view_frame').src = '';
            articleViewPage.style.opacity = '1';
            siteHeader.classList.remove('hidden');
            content.classList.remove('hidden');
            analysisPage.style.opacity = '0';
            analysisPage.classList.add('is-active');
            analysisPage.offsetHeight;
            analysisPage.style.opacity = '1';
        }, 300);
    };
    
    document.querySelector('.article-view_close')?.addEventListener('click', () => {
        history.pushState(null, '', '/analysis');
        loadPageFromPath();
    });
    
    // Notes view
    const openNotesView = (articleId) => {
        const article = articleData[articleId];
        if (!article?.notes) return;
        
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        notesViewPage.querySelector('.notes-view_frame').src = article.notes;
        content.classList.add('hidden');
        
        setTimeout(() => {
            document.querySelector('[data-page-section="analysis"]').classList.remove('is-active');
            notesViewPage.style.opacity = '0';
            notesViewPage.classList.add('is-active');
            notesViewPage.offsetHeight;
            notesViewPage.style.opacity = '1';
        }, 300);
    };
    
    const closeNotesView = () => {
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        const analysisPage = document.querySelector('[data-page-section="analysis"]');
        
        updateNavSelection('analysis');
        notesViewPage.style.opacity = '0';
        
        setTimeout(() => {
            notesViewPage.classList.remove('is-active');
            notesViewPage.querySelector('.notes-view_frame').src = '';
            notesViewPage.style.opacity = '1';
            content.classList.remove('hidden');
            analysisPage.style.opacity = '0';
            analysisPage.classList.add('is-active');
            analysisPage.offsetHeight;
            analysisPage.style.opacity = '1';
        }, 300);
    };
    
    document.querySelector('.notes-view_close')?.addEventListener('click', () => {
        history.pushState(null, '', '/analysis');
        loadPageFromPath();
    });
    
    document.querySelectorAll('.notes-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            history.pushState(null, '', `/analysis/${link.getAttribute('data-notes')}/notes`);
            loadPageFromPath();
        });
    });
    
    // Photo viewer
    document.querySelectorAll('.gallery_photo').forEach(photo => {
        photo.addEventListener('click', function() {
            photoViewImage.src = this.src;
            photoView.classList.add('active');
            siteHeader.classList.add('hidden');
        });
    });
    
    document.querySelector('.photo-view_close').addEventListener('click', () => {
        photoView.classList.remove('active');
        siteHeader.classList.remove('hidden');
    });
    
    // Route handling
    const loadPageFromPath = () => {
        let path = location.pathname.replace(/^\//, '').replace(/\/$/, '');
        
        if (!path || path === 'index.html' || path === 'home') {
            if (!document.querySelector('[data-page-section="home"]').classList.contains('is-active')) {
                navigateToPage('home');
            }
            return;
        }
        
        const articleViewPage = document.querySelector('[data-page-section="article-view"]');
        const notesViewPage = document.querySelector('[data-page-section="notes-view"]');
        
        if (path === 'analysis') {
            if (articleViewPage.classList.contains('is-active')) return closeArticleView();
            if (notesViewPage.classList.contains('is-active')) return closeNotesView();
        }
        
        if (path.startsWith('projects/')) {
            const projectId = path.split('/')[1];
            if (projectData[projectId]) {
                const projectsPage = document.querySelector('[data-page-section="projects"]');
                const detailPage = document.querySelector('[data-page-section="project-detail"]');
                
                if (!projectsPage.classList.contains('is-active') && !detailPage.classList.contains('is-active')) {
                    navigateToPage('projects');
                    setTimeout(() => openProjectDetail(projectId), 350);
                } else if (projectsPage.classList.contains('is-active')) {
                    openProjectDetail(projectId);
                }
                return;
            }
        }
        
        if (path.startsWith('analysis/')) {
            const [_, articleId, notesPath] = path.split('/');
            if (articleData[articleId]) {
                const analysisPage = document.querySelector('[data-page-section="analysis"]');
                const isNotes = notesPath === 'notes';
                
                if (!analysisPage.classList.contains('is-active') && !articleViewPage.classList.contains('is-active') && !notesViewPage.classList.contains('is-active')) {
                    navigateToPage('analysis');
                    setTimeout(() => isNotes ? openNotesView(articleId) : openArticleView(articleId), 350);
                } else if (analysisPage.classList.contains('is-active')) {
                    isNotes ? openNotesView(articleId) : openArticleView(articleId);
                }
                return;
            }
        }
        
        const targetPage = document.querySelector(`[data-page-section="${path}"]`);
        if (targetPage && !targetPage.classList.contains('is-active')) {
            navigateToPage(path);
        }
    };
    
    const navigateToPage = (pageName) => {
        updateNavSelection(pageName);
        
        const currentPage = document.querySelector('.page.is-active');
        if (!currentPage) return;
        
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
    };
    
    // Escape 
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        
        if (photoView.classList.contains('active')) {
            photoView.classList.remove('active');
            siteHeader.classList.remove('hidden');
        } else if (document.querySelector('[data-page-section="project-detail"]').classList.contains('is-active')) {
            history.pushState(null, '', '/projects');
            loadPageFromPath();
        } else if (document.querySelector('[data-page-section="article-view"]').classList.contains('is-active')) {
            history.pushState(null, '', '/analysis');
            loadPageFromPath();
        } else if (document.querySelector('[data-page-section="notes-view"]').classList.contains('is-active')) {
            history.pushState(null, '', '/analysis');
            loadPageFromPath();
        }
    });
    
    loadPageFromPath();
    window.addEventListener('popstate', loadPageFromPath);
});
