(function() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
    
    // Hide cursor in article/notes views
    ['.article-view', '.notes-view'].forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener('mouseenter', () => cursor.style.opacity = '0');
            element.addEventListener('mouseleave', () => cursor.style.opacity = '1');
        }
    });
    
    // Gallery photo hover effects
    document.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('gallery_photo')) {
            cursor.classList.add('cursor-plus');
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.classList.contains('gallery_photo')) {
            cursor.classList.remove('cursor-plus');
        }
    }, true);
})();
