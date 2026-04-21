(function() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.65;
        cursorY += (mouseY - cursorY) * 0.65;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    document.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', function() {
        cursor.style.opacity = '1';
    });
    
    const articleView = document.querySelector('.article-view');
    const notesView = document.querySelector('.notes-view');
    
    if (articleView) {
        articleView.addEventListener('mouseenter', function() {
            cursor.style.opacity = '0';
        });
        articleView.addEventListener('mouseleave', function() {
            cursor.style.opacity = '1';
        });
    }
    
    if (notesView) {
        notesView.addEventListener('mouseenter', function() {
            cursor.style.opacity = '0';
        });
        notesView.addEventListener('mouseleave', function() {
            cursor.style.opacity = '1';
        });
    }
    
    document.addEventListener('mouseenter', function(e) {
        if (e.target.classList.contains('gallery_photo')) {
            cursor.classList.add('cursor-plus');
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.classList.contains('gallery_photo')) {
            cursor.classList.remove('cursor-plus');
        }
    }, true);
})();
