
// js/ui-controls.js - UI Controls Module
// Handles sidebar toggle, footer, and other UI controls

window.ForteUIControls = {
    app: null,
    sidebar: null,
    sidebarToggle: null,
    isSidebarCollapsed: false, // Default state

    init(appInstance) {
        this.app = appInstance;
        this.sidebar = document.getElementById('filter-sidebar');
        // The toggle button is created dynamically if not found,
        // or an existing one with id 'sidebar-toggle' can be used.
        this.sidebarToggle = document.getElementById('sidebar-toggle'); 
        
        if (!this.sidebar) {
            console.warn('[UIControls] Sidebar element (filter-sidebar) not found. Cannot initialize sidebar controls.');
            return;
        }

        this.setupSidebarToggle();
        this.createFooterElements(); // Assumes footer HTML exists
        this.createCreditsPopup();   // Logic for credits popup
        this.loadSidebarState();     // Load saved state and apply
        
        console.log('[UIControls] Module initialized');
    },

    setupSidebarToggle() {
        // If sidebar element doesn't exist, we can't setup toggle for it.
        if (!this.sidebar) return;

        // Create toggle button dynamically if it's not already in the HTML
        // and attached to the sidebar element.
        if (!this.sidebarToggle || !this.sidebar.contains(this.sidebarToggle)) {
            // If an old toggle exists but not in sidebar, remove it before creating new one
            if (this.sidebarToggle && this.sidebarToggle.parentNode) {
                this.sidebarToggle.parentNode.removeChild(this.sidebarToggle);
            }
            this.createSidebarToggle(); // This will append it to this.sidebar
        }
        
        // Ensure event listener is attached
        if (this.sidebarToggle) {
            // Remove existing listener to prevent duplicates if init is called multiple times
            this.sidebarToggle.removeEventListener('click', this.handleToggleClick);
            this.sidebarToggle.addEventListener('click', this.handleToggleClick.bind(this)); // Bind 'this' context
            
            this.sidebarToggle.removeEventListener('keydown', this.handleToggleKeydown);
            this.sidebarToggle.addEventListener('keydown', this.handleToggleKeydown.bind(this)); // Bind 'this' context
        } else {
            console.warn('[UIControls] Sidebar toggle could not be set up.');
        }
    },

    // Handler function to ensure 'this' context is correct
    handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[UIControls] Sidebar toggle clicked via handler');
        this.toggleSidebar();
    },

    handleToggleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleSidebar();
        }
    },

    createSidebarToggle() {
        // This function assumes this.sidebar exists.
        if (!this.sidebar) return;

        const toggle = document.createElement('div');
        toggle.id = 'sidebar-toggle';
        toggle.className = 'sidebar-toggle'; // CSS will style this
        toggle.innerHTML = `<i class="fas ${this.isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}"></i>`;
        toggle.setAttribute('aria-label', this.isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar');
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        
        // Appending to this.sidebar. CSS must ensure it's visible when sidebar is collapsed.
        // The CSS change to remove `overflow:hidden` from `.app-sidebar.collapsed` is key.
        this.sidebar.appendChild(toggle);
        this.sidebarToggle = toggle; // Store reference to the newly created toggle
        
        console.log('[UIControls] Sidebar toggle button dynamically created and appended.');
    },

    toggleSidebar() {
        if (!this.sidebar || !this.sidebarToggle) {
            console.warn('[UIControls] Cannot toggle sidebar: Sidebar or toggle element missing.');
            return;
        }
        
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        
        console.log('[UIControls] Toggling sidebar. Now collapsed:', this.isSidebarCollapsed);
        
        this.sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
        
        // Update toggle icon and aria-label
        const icon = this.sidebarToggle.querySelector('i');
        if (icon) {
            icon.className = this.isSidebarCollapsed ? 
                'fas fa-chevron-right' : 
                'fas fa-chevron-left';
        }
        this.sidebarToggle.setAttribute('aria-label', 
            this.isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'
        );
        
        this.saveSidebarState();
        
        // Dispatch event for other modules that might need to react to sidebar changes (e.g., gallery resizing)
        document.dispatchEvent(new CustomEvent('sidebarToggled', {
            detail: { collapsed: this.isSidebarCollapsed }
        }));
    },

    saveSidebarState() {
        try {
            localStorage.setItem('forteSidebarCollapsed', this.isSidebarCollapsed ? '1' : '0');
        } catch (e) {
            console.warn('[UIControls] Could not save sidebar state to localStorage:', e);
        }
    },

    loadSidebarState() {
        if (!this.sidebar || !this.sidebarToggle) {
             // If called before toggle is created, defer or handle carefully.
             // For now, we assume setupSidebarToggle has run or toggle exists.
            console.warn('[UIControls] Cannot load sidebar state: Sidebar or toggle element missing at load time.');
           // return; // If toggle isn't ready, can't update it.
        }

        try {
            const savedState = localStorage.getItem('forteSidebarCollapsed');
            // Apply saved state only if it's explicitly '1' (collapsed) or '0' (expanded)
            // Default to not collapsed if no saved state or invalid state.
            this.isSidebarCollapsed = savedState === '1'; 

            if (this.sidebar) {
                 this.sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
            }
            
            if (this.sidebarToggle) { // Ensure toggle exists before trying to update it
                const icon = this.sidebarToggle.querySelector('i');
                if (icon) {
                    icon.className = this.isSidebarCollapsed ? 
                        'fas fa-chevron-right' : 
                        'fas fa-chevron-left';
                }
                this.sidebarToggle.setAttribute('aria-label', 
                    this.isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'
                );
            } else if (this.isSidebarCollapsed) {
                // If toggle isn't there yet but state is collapsed, createSidebarToggle will use this.isSidebarCollapsed
                // to set the correct initial icon.
            }

        } catch (e) {
            console.warn('[UIControls] Could not load sidebar state from localStorage:', e);
            // Default to not collapsed in case of error
            this.isSidebarCollapsed = false; 
            if(this.sidebar) this.sidebar.classList.remove('collapsed');
        }
    },

    createFooterElements() {
        // This function assumes the footer HTML structure already exists.
        // It's primarily for wiring up interactive elements within the footer.
        const creditsLink = document.getElementById('footer-credits-link');
        if (creditsLink) {
            creditsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCredits();
            });
        }
    },

    createCreditsPopup() {
        // Credits popup will be created on demand when openCredits() is called.
        // No action needed here during init.
    },

    openCredits() {
        // Close any existing credits modal first
        const existingModal = document.querySelector('.credits-popup-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const creditsModal = document.createElement('div');
        // Using a more specific class to avoid conflict with key-popup-overlay if styles differ
        creditsModal.className = 'credits-popup-overlay key-popup-overlay'; 
        creditsModal.style.display = 'flex'; // Ensure it's visible
        creditsModal.style.opacity = '0';    // Start transparent for fade-in
        
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
                        <li>TailwindCSS for utility styling (Note: custom CSS is primary)</li>
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
            // Remove from DOM after transition
            creditsModal.addEventListener('transitionend', () => {
                if (document.body.contains(creditsModal)) {
                    document.body.removeChild(creditsModal);
                }
            }, { once: true });
        };
        
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
        // Click on overlay to close
        creditsModal.addEventListener('click', (e) => {
            if (e.target === creditsModal) closeModal();
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        // Ensure listener is removed if modal is closed by other means
        creditsModal.addEventListener('transitionend', () => {
            if (creditsModal.style.opacity === '0') {
                 document.removeEventListener('keydown', escHandler);
            }
        });
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        // Using a more specific class for toasts
        toast.className = `custom-toast custom-toast-${type}`; 
        toast.textContent = message;
        
        // Basic styling, can be enhanced with CSS classes
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            zIndex: '10000', // Ensure it's on top
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: 'translateY(20px)', // Start off-screen for slide-in
            backgroundColor: type === 'success' ? '#22c55e' : 
                             type === 'error' ? '#ef4444' : 
                             type === 'warning' ? '#f59e0b' : '#3b82f6' // Default info
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.addEventListener('transitionend', () => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, { once: true });
        }, 3000);
    },

    isMobileDevice() {
        return window.innerWidth <= 768;
    },

    isTabletDevice() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    refreshSidebarToggle() {
        // This can be called if the DOM structure changes and the toggle needs to be re-established.
        if (this.sidebar && (!this.sidebarToggle || !this.sidebar.contains(this.sidebarToggle))) {
            console.log('[UIControls] Refreshing sidebar toggle.');
            this.setupSidebarToggle(); // Re-run setup which creates if needed
        }
    }
};

// Note: The app.js file you provided doesn't seem to require changes for this specific
// sidebar behavior fix, as the toggle logic is primarily within ForteUIControls and CSS.
// window.ForteApp = new ForteCardApp(); // This would typically be in app.js or your main script entry point
