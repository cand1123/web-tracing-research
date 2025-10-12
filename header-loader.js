// Header Loader Script
class HeaderLoader {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isLoggedIn = this.checkLoginStatus();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Map filename to page identifier
        const pageMap = {
            'main-content.html': 'main-content',
            'main-pustakana.html': 'main-pustakana',
            'password-manager.html': 'password-manager',
            'main-proposal.html': 'proposal',
            'contact.html': 'contact',
            'index.html': 'main-content' // Default untuk index
        };
        
        return pageMap[filename] || 'main-content';
    }

    checkLoginStatus() {
        // Check if user is logged in by looking for session data
        const idToken = sessionStorage.getItem('google_id_token');
        const userInfo = sessionStorage.getItem('user_info');
        const isLoggedIn = !!(idToken && userInfo);
        
        
        return isLoggedIn;
    }

    async loadHeader() {
        try {
            // Load header HTML
            const headerResponse = await fetch('header-component.html');
            const headerHTML = await headerResponse.text();
            
            // Load header CSS
            const cssResponse = await fetch('header-styles.css');
            const cssText = await cssResponse.text();
            
            // Create style element and add CSS
            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            document.head.appendChild(styleElement);
            
            // Insert header HTML
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = headerHTML;
                this.setActivePage();
                this.initializeNavigation();
            } else {
                console.error('Header container not found');
            }
        } catch (error) {
            console.error('Error loading header:', error);
            this.showFallbackHeader();
        }
    }

    setActivePage() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const pageId = link.getAttribute('data-page');
            const href = link.getAttribute('href');
            
            // Check both data-page attribute and href for better compatibility
            if (pageId === this.currentPage || href === this.getCurrentPageFilename()) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show/hide login/logout buttons based on login status
        this.updateLoginButtons();
    }
    
    getCurrentPageFilename() {
        const path = window.location.pathname;
        return path.split('/').pop();
    }

    updateLoginButtons() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (this.isLoggedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    initializeNavigation() {
        const btn = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links');
        
        if (btn && links) {
            btn.addEventListener('click', function(){
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', String(!expanded));
                if(!expanded){ 
                    links.style.display = 'flex'; 
                } else { 
                    links.style.display = ''; 
                }
            });

            // Close menu when clicking outside (mobile)
            document.addEventListener('click', function(e){
                if(window.innerWidth <= 860){
                    if(!e.target.closest('.nav')){
                        links.style.display = '';
                        btn && btn.setAttribute('aria-expanded','false');
                    }
                }
            });

            // Keyboard accessibility: close on Escape
            document.addEventListener('keydown', function(e){ 
                if(e.key === 'Escape'){ 
                    links.style.display = ''; 
                    btn && btn.setAttribute('aria-expanded','false'); 
                }
            });

            // Logout button event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
        }
    }

    // Set active page for iframe context
    setActivePageIframe() {
        const currentPage = parent.location.pathname.split('/').pop() || 'main-content.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const pageId = link.getAttribute('data-page');
            
            if (href === currentPage || pageId === this.getPageIdFromFilename(currentPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    getPageIdFromFilename(filename) {
        const pageMap = {
            'main-content.html': 'main-content',
            'main-pustakana.html': 'main-pustakana',
            'password-manager.html': 'password-manager',
            'main-proposal.html': 'proposal',
            'contact.html': 'contact',
            'index.html': 'main-content'
        };
        return pageMap[filename] || 'main-content';
    }

    // Navigation functions for iframe
    navigateToPage(page) {
        parent.location.href = page;
    }

    handleLogout() {
        try {
            // Clear session storage
            sessionStorage.removeItem('google_id_token');
            sessionStorage.removeItem('user_info');
            
            // Sign out from Firebase if available
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut();
            }
            
            // Redirect to login page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    showFallbackHeader() {
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div style="padding: 18px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; margin: 18px;">
                    <p style="color: #6b7280; text-align: center;">Header tidak dapat dimuat. Periksa koneksi internet atau file header-component.html.</p>
                </div>
            `;
        }
    }
    
    // Public method to manually update active page
    updateActivePage() {
        this.currentPage = this.getCurrentPage();
        this.setActivePage();
    }
    
    // Public method to set specific page as active
    setSpecificPageActive(pageId) {
        this.currentPage = pageId;
        this.setActivePage();
    }
    
    // Cleanup method to prevent memory leaks
    cleanup() {
        if (this.urlObserver) {
            this.urlObserver.disconnect();
        }
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
    }
}

// Initialize header loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const headerLoader = new HeaderLoader();
    
    // Make headerLoader available globally
    window.headerLoader = headerLoader;
    
    // Check if we're in iframe context (header-component.html)
    if (window.parent !== window) {
        // We're in iframe, initialize iframe-specific functionality
        headerLoader.setActivePageIframe();
        
        // Make functions available to parent
        window.parent.setActivePageIframe = headerLoader.setActivePageIframe.bind(headerLoader);
        window.parent.navigateToPage = headerLoader.navigateToPage.bind(headerLoader);
    } else {
        // We're in main page, load header normally
        headerLoader.loadHeader();
        
        // Listen for URL changes (for SPA or dynamic navigation)
        let currentUrl = window.location.href;
        
        // Use a more efficient approach with MutationObserver
        headerLoader.urlObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                
                // Update current page and refresh active state
                headerLoader.currentPage = headerLoader.getCurrentPage();
                headerLoader.setActivePage();
            }
        });
        
        // Observe changes to the document title (which often changes with navigation)
        headerLoader.urlObserver.observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['title']
        });
        
        // Listen for popstate events (back/forward button)
        window.addEventListener('popstate', () => {
            headerLoader.currentPage = headerLoader.getCurrentPage();
            headerLoader.setActivePage();
        });
        
        // Listen for navigation events (if using custom navigation)
        window.addEventListener('navigate', (event) => {
            headerLoader.currentPage = headerLoader.getCurrentPage();
            headerLoader.setActivePage();
        });
        
        // Cleanup when page is about to unload (avoid permissions policy violation)
        window.addEventListener('pagehide', () => {
            headerLoader.cleanup();
        });
        
        // Alternative cleanup for older browsers
        window.addEventListener('beforeunload', () => {
            headerLoader.cleanup();
        });
    }
});
