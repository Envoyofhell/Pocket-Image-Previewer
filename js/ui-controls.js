// js/ui-controls.js - UI Controls Module
// Handles sidebar toggle, footer, and other UI controls

window.ForteUIControls = {
    app: null,
    sidebar: null,
    sidebarToggle: null,
    isSidebarCollapsed: false,

    init(appInstance) {
        this.app = appInstance;
        this.sidebar = document.getElementById('filter-sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        
        this.setupSidebarToggle();
        this.createFooterElements();
        this.createCreditsPopup();
        this.loadSidebarState();
        
        console.log('[UIControls] Module initialized');
    },

    setupSidebarToggle() {
        if (!this.sidebar || !this.sidebarToggle) return;
        
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });
    },

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        
        this.sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
        this.sidebarToggle.innerHTML = this.isSidebarCollapsed ? 
            '<i class="fas fa-chevron-right"></i>' : 
            '<i class="fas fa-chevron-left"></i>';
        
        this.saveSidebarState();
    },

    saveSidebarState() {
        try {
            localStorage.setItem('forteSidebarCollapsed', this.isSidebarCollapsed ? '1' : '0');
        } catch (e) {
            console.warn('[UIControls] Could not save sidebar state:', e);
        }
    },

    loadSidebarState() {
        try {
            const savedState = localStorage.getItem('forteSidebarCollapsed');
            if (savedState === '1') {
                this.isSidebarCollapsed = true;
                this.sidebar.classList.add('collapsed');
                this.sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
            }
        } catch (e) {
            console.warn('[UIControls] Could not load sidebar state:', e);
        }
    },

    createFooterElements() {
        // Footer should already exist in HTML, just need to wire up the credits link
        const creditsLink = document.getElementById('footer-credits-link');
        if (creditsLink) {
            creditsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCredits();
            });
        }
    },

    createCreditsPopup() {
        // Credits popup will be created on demand
    },

    openCredits() {
        const creditsModal = document.createElement('div');
        creditsModal.className = 'key-popup-overlay';
        creditsModal.style.display = 'flex';
        creditsModal.style.opacity = '0';
        
        creditsModal.innerHTML = `
            <div class="key-popup-content" style="max-width: 600px;">
                <div class="key-popup-header">
                    <h3 class="key-popup-title">
                        <i class="fas fa-info-circle mr-2"></i>Credits & Acknowledgments
                    </h3>
                    <button class="key-popup-close" aria-label="Close credits">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="key-popup-body">
                    <h4>Development Team</h4>
                    <ul>
                        <li><strong>WebDesigner</strong> - Frontend Development & UI Design</li>
                        <li><strong>EnvoyOfHell</strong> - Project Lead & Backend Integration</li>
                        <li><strong>Forte Community Team</strong> - Card Data Management</li>
                    </ul>
                    
                    <h4>Artwork & Design</h4>
                    <ul>
                        <li>All card artwork belongs to their respective artists as credited on each card</li>
                        <li>UI Design inspired by modern card collection applications</li>
                    </ul>
                    
                    <h4>Technologies Used</h4>
                    <ul>
                        <li>HTML5, CSS3, JavaScript (ES6+)</li>
                        <li>TailwindCSS for utility styling</li>
                        <li>Font Awesome for icons</li>
                        <li>Google Fonts (Inter & Pirata One)</li>
                        <li>GitHub for code hosting</li>
                        <li>Cloudflare Pages for deployment</li>
                    </ul>
                    
                    <h4>Special Thanks</h4>
                    <ul>
                        <li>The entire Forte community for their support and contributions</li>
                        <li>Card creators and artists for their amazing work</li>
                        <li>Beta testers who provided valuable feedback</li>
                    </ul>
                    
                    <p class="note">Version 2.5 - Forte Card Previewer &copy; 2023-2025</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(creditsModal);
        
        // Animate in
        requestAnimationFrame(() => {
            creditsModal.style.opacity = '1';
        });
        
        // Close handlers
        const closeButton = creditsModal.querySelector('.key-popup-close');
        const closeModal = () => {
            creditsModal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(creditsModal);
            }, 300);
        };
        
        closeButton.addEventListener('click', closeModal);
        creditsModal.addEventListener('click', (e) => {
            if (e.target === creditsModal) closeModal();
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    },

    // Utility methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            zIndex: '10000',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            backgroundColor: type === 'success' ? '#22c55e' : 
                           type === 'error' ? '#ef4444' : 
                           type === 'warning' ? '#f59e0b' : '#3b82f6'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.style.opacity = '1', 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    },

    createLoadingSpinner(parent) {
        const spinner = document.createElement('div');
        spinner.className = 'loader';
        spinner.style.cssText = `
            border: 4px solid rgba(229, 231, 235, 0.2);
            border-top-color: var(--color-primary, #f87171);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        `;
        
        if (parent) {
            parent.appendChild(spinner);
        }
        
        return spinner;
    },

    removeLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    },

    // Responsive utilities
    isMobileDevice() {
        return window.innerWidth <= 768;
    },

    isTabletDevice() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    },

    fadeOut(element, duration = 300, callback) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, duration);
    },

    slideUp(element, duration = 300) {
        element.style.transition = `all ${duration}ms ease`;
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.opacity = '0';
    },

    slideDown(element, duration = 300) {
        element.style.transition = `all ${duration}ms ease`;
        element.style.height = 'auto';
        element.style.overflow = 'visible';
        element.style.opacity = '1';
    }
};