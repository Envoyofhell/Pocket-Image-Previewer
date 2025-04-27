// settings.js

(function() { // IIFE for encapsulation
    'use strict';

    // --- Default Settings ---
    const defaultSettings = {
        musicAutoplay: false, // Default to OFF as autoplay can be intrusive
        effectsEnabled: true,
        backgroundIntensity: 0.5 // Example: 0=min, 1=max
    };

    // --- Keys for localStorage ---
    const STORAGE_PREFIX = 'fortePreviewerSettings_';
    const SETTINGS_KEY = `${STORAGE_PREFIX}all`; // Store all settings in one object

    // --- Helper Functions ---
    /** Loads settings from localStorage or uses defaults */
    function loadSettings() {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                // Merge stored settings with defaults to ensure all keys exist
                return { ...defaultSettings, ...JSON.parse(storedSettings) };
            }
        } catch (e) {
            console.error("[Settings] Error loading settings from localStorage:", e);
        }
        return { ...defaultSettings }; // Return defaults on error or if nothing stored
    }

    /** Saves the current settings object to localStorage */
    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("[Settings] Error saving settings to localStorage:", e);
        }
    }

    /** Dispatches a custom event to notify other parts of the app about a setting change */
    function dispatchSettingChangeEvent(settingName, value) {
        document.dispatchEvent(new CustomEvent('forteSettingChanged', {
            detail: { setting: settingName, value: value }
        }));
        console.log(`[Settings] Dispatched event: forteSettingChanged - ${settingName}: ${value}`);
    }


    /** --- CSS Injection --- */
    function injectSettingsCSS() {
        // Reuse legend popup styles where possible, add specifics for settings
        const css = `
            /* Settings Button (Example: Gear Icon) */
            .settings-button {
                background-color: rgba(107, 114, 128, 0.3);
                color: var(--color-text-secondary, #ccc);
                border: 1px solid var(--color-border, #555);
                border-radius: 50%;
                padding: 0.3rem 0.5rem;
                font-size: 0.9rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                margin-left: 0.5rem; /* Adjust as needed */
                align-self: center;
            }
            .settings-button:hover {
                background-color: rgba(107, 114, 128, 0.5);
                color: var(--color-text-primary, #fff);
                border-color: var(--color-accent, #facc15);
            }

            /* Settings Modal - Reuse key-popup styles if defined globally, or redefine */
            .settings-modal-overlay {
                position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.75);
                display: none; align-items: center; justify-content: center;
                z-index: 1050; opacity: 0; transition: opacity 0.3s ease-in-out;
            }
            .settings-modal-overlay.visible { display: flex; opacity: 1; }
            .settings-content {
                background-color: var(--color-background-alt, #1f2937);
                color: var(--color-text-primary, #f3f4f6);
                border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                width: 90%; max-width: 500px; max-height: 85vh;
                border: 1px solid var(--color-border, #4b5563);
                overflow: hidden; /* Prevent content overflow before scroll */
                display: flex;
                flex-direction: column;
            }
            .settings-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border, #4b5563);
                background-color: rgba(0,0,0,0.2); /* Slightly darker header */
            }
            .settings-title { font-size: 1.125rem; font-weight: bold; color: var(--color-accent, #facc15); }
            .settings-close { background: none; border: none; font-size: 1.3rem; color: var(--color-text-secondary, #9ca3af); cursor: pointer; padding: 0.25rem; line-height: 1; }
            .settings-close:hover { color: var(--color-text-primary, #f3f4f6); }
            .settings-body { padding: 1rem 1.25rem; overflow-y: auto; flex-grow: 1; } /* Allow body to scroll */

            .settings-section { margin-bottom: 1.5rem; }
            .settings-section h4 {
                font-weight: bold; margin-bottom: 0.75rem; color: var(--color-accent, #facc15);
                border-bottom: 1px solid var(--color-border-light, #374151); padding-bottom: 0.3rem;
                font-size: 1rem;
            }
            .setting-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0.25rem 0;}
            .setting-item label { color: var(--color-text-secondary, #d1d5db); font-size: 0.95rem; margin-right: 1rem; }
            .setting-item .description { font-size: 0.8rem; color: #9ca3af; margin-top: -0.5rem; flex-basis: 100%;} /* Optional description */

            /* Simple Toggle Switch CSS */
            .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
            .toggle-switch input { opacity: 0; width: 0; height: 0; }
            .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .3s; border-radius: 24px; }
            .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .toggle-slider { background-color: var(--color-accent, #fbbf24); } /* Use accent color */
            input:focus + .toggle-slider { box-shadow: 0 0 1px var(--color-accent, #fbbf24); }
            input:checked + .toggle-slider:before { transform: translateX(20px); }

            /* Slider Style */
            .settings-slider { width: 100px; height: 8px; background: #555; outline: none; opacity: 0.7; transition: opacity .2s; border-radius: 4px; cursor: pointer; appearance: none; -webkit-appearance: none; margin-left: auto; }
            .settings-slider:hover { opacity: 1; }
            .settings-slider::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; background: var(--color-accent, #fbbf24); border-radius: 50%; cursor: pointer; }
            .settings-slider::-moz-range-thumb { width: 16px; height: 16px; background: var(--color-accent, #fbbf24); border-radius: 50%; cursor: pointer; border: none;}

            /* Button Style */
            .settings-button-action {
                background-color: #dc2626; /* Red for destructive action */
                color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px;
                font-size: 0.9rem; cursor: pointer; transition: background-color 0.2s;
                margin-left: auto; /* Push to right */
            }
            .settings-button-action:hover { background-color: #b91c1c; }

            .settings-placeholder { color: #6b7280; font-style: italic; font-size: 0.9rem; }
        `;
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'settings-modal-styles';
        styleElement.appendChild(document.createTextNode(css));
        document.head.appendChild(styleElement);
        console.log("[Settings] CSS injected.");
    }

    /** --- HTML Creation --- */
    function createSettingsHTML() {
        // Create Settings Button (Gear Icon)
        const button = document.createElement('button');
        button.id = 'settings-button';
        button.className = 'settings-button';
        button.title = 'Open Settings';
        button.setAttribute('aria-label', 'Open Settings');
        button.innerHTML = '<i class="fas fa-cog"></i>';

        // Find target container (e.g., next to key button or in controls area)
        const keyButton = document.getElementById('key-info-button');
        if (keyButton && keyButton.parentElement) {
             keyButton.parentElement.insertBefore(button, keyButton.nextSibling); // Insert after key button
        } else {
             const controlsContainer = document.querySelector('#filter-controls'); // Fallback
             if (controlsContainer) {
                controlsContainer.appendChild(button);
             } else {
                console.warn("[Settings] Could not find #filter-controls or key button to append settings button.");
                // Further fallback if needed
                document.body.appendChild(button);
                 button.style.position = 'fixed'; button.style.top = '10px'; button.style.right = '50px'; button.style.zIndex = '900';
             }
        }


        // Create Modal Structure
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h3 class="settings-title"><i class="fas fa-sliders-h mr-2"></i>Settings</h3>
                    <button id="settings-modal-close" class="settings-close" aria-label="Close settings">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="settings-section">
                        <h4>Audio</h4>
                        <div class="setting-item">
                            <label for="setting-music-autoplay">Music Autoplay</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-music-autoplay">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h4>Visual Effects</h4>
                        <div class="setting-item">
                            <label for="setting-effects-enabled">Enable Effects</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-effects-enabled">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                         <div class="setting-item">
                            <label for="setting-bg-intensity" title="Adjust background animation speed/intensity">Background Intensity</label>
                             <input type="range" id="setting-bg-intensity" min="0" max="1" step="0.1" class="settings-slider">
                        </div>
                         <p class="description">Toggles card holo effects, background animations, and potentially other visual flair.</p>
                    </div>

                     <div class="settings-section">
                        <h4>Data</h4>
                         <div class="setting-item">
                            <label for="setting-clear-likes">Additional Options for liking coming soon</label>
                            <label for="setting-clear-likes">Clear Liked Cards</label>
                            <button id="setting-clear-likes" class="settings-button-action">Clear Data</button>
                        </div>
                        <p class="description">Removes all your locally stored 'likes' for cards.</p>
                    </div>

                    <div class="settings-section">
                        <h4>Appearance (Future)</h4>
                        <p class="settings-placeholder">Theme selection coming soon!</p>
                    </div>

                </div>
            </div>`;

        document.body.appendChild(modal);
        console.log("[Settings] HTML elements created.");
    }

    /** --- Event Handling & Initialization --- */
    function initializeSettings() {
        console.log("[Settings] Initializing...");

        createSettingsHTML(); // Create elements first
        injectSettingsCSS(); // Then inject CSS

        // Get references AFTER creation
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const settingsCloseButton = document.getElementById('settings-modal-close');
        const musicAutoplayToggle = document.getElementById('setting-music-autoplay');
        const effectsEnabledToggle = document.getElementById('setting-effects-enabled');
        const bgIntensitySlider = document.getElementById('setting-bg-intensity');
        const clearLikesButton = document.getElementById('setting-clear-likes');

        if (!settingsButton || !settingsModal || !settingsCloseButton || !musicAutoplayToggle || !effectsEnabledToggle || !bgIntensitySlider || !clearLikesButton) {
            console.error("[Settings] Failed to find necessary elements after creation.");
            return;
        }

        let currentSettings = loadSettings();

        // --- Apply Initial Settings ---
        function applyAllSettings(settings) {
            // Music Autoplay
            musicAutoplayToggle.checked = settings.musicAutoplay;
            dispatchSettingChangeEvent('musicAutoplay', settings.musicAutoplay);

            // Effects Enabled
            effectsEnabledToggle.checked = settings.effectsEnabled;
            // Add/Remove global class for CSS transitions/animations
            document.body.classList.toggle('effects-disabled', !settings.effectsEnabled);
            // Dispatch event for JS-based effects (background, holo)
            dispatchSettingChangeEvent('effectsEnabled', settings.effectsEnabled);

            // Background Intensity
            bgIntensitySlider.value = settings.backgroundIntensity;
            bgIntensitySlider.disabled = !settings.effectsEnabled; // Disable slider if effects are off
            dispatchSettingChangeEvent('backgroundIntensity', settings.backgroundIntensity);

            // Set global flag for easy checking in holo effect code etc.
             window.effectsEnabled = settings.effectsEnabled;
        }

        applyAllSettings(currentSettings); // Apply loaded settings on init

        // --- Modal Open/Close Logic ---
        const openSettingsModal = () => {
            settingsModal.style.display = 'flex';
            void settingsModal.offsetWidth; // Trigger reflow
            settingsModal.classList.add('visible');
            settingsModal.setAttribute('aria-hidden', 'false');
            settingsCloseButton.focus();
            document.addEventListener('keydown', handleSettingsEscKey);
            console.log("[Settings] Opened.");
        };

        const closeSettingsModal = () => {
            settingsModal.classList.remove('visible');
            settingsModal.setAttribute('aria-hidden', 'true');
            document.removeEventListener('keydown', handleSettingsEscKey);

            const handleTransitionEnd = () => {
                 if (!settingsModal.classList.contains('visible')) {
                     settingsModal.style.display = 'none';
                 }
            };
            settingsModal.removeEventListener('transitionend', handleTransitionEnd);
            settingsModal.addEventListener('transitionend', handleTransitionEnd, { once: true });
             setTimeout(() => { // Fallback
                  if (!settingsModal.classList.contains('visible')) {
                     settingsModal.style.display = 'none';
                 }
             }, 400);
            console.log("[Settings] Closed.");
             settingsButton.focus(); // Refocus opener
        };

        const handleSettingsEscKey = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                closeSettingsModal();
            }
        };

        // --- Attach Control Listeners ---
        musicAutoplayToggle.addEventListener('change', (e) => {
            currentSettings.musicAutoplay = e.target.checked;
            saveSettings(currentSettings);
            dispatchSettingChangeEvent('musicAutoplay', currentSettings.musicAutoplay);
        });

        effectsEnabledToggle.addEventListener('change', (e) => {
            currentSettings.effectsEnabled = e.target.checked;
            saveSettings(currentSettings);
             window.effectsEnabled = currentSettings.effectsEnabled; // Update global flag
            document.body.classList.toggle('effects-disabled', !currentSettings.effectsEnabled);
             bgIntensitySlider.disabled = !currentSettings.effectsEnabled; // Enable/disable slider
            dispatchSettingChangeEvent('effectsEnabled', currentSettings.effectsEnabled);
        });

        bgIntensitySlider.addEventListener('input', (e) => { // Use 'input' for live updates
            currentSettings.backgroundIntensity = parseFloat(e.target.value);
            // Don't save on every input event, maybe only on 'change' or debounce? For now, let's save.
             saveSettings(currentSettings);
            dispatchSettingChangeEvent('backgroundIntensity', currentSettings.backgroundIntensity);
        });
         // Optional: Save only when user stops sliding
         /*
         bgIntensitySlider.addEventListener('change', (e) => {
             currentSettings.backgroundIntensity = parseFloat(e.target.value);
             saveSettings(currentSettings);
             // Event already dispatched by 'input', no need to dispatch again unless only using 'change'
         });
         */


        clearLikesButton.addEventListener('click', () => {
            if (window.confirm("Are you sure you want to clear all your liked cards? This action cannot be undone.")) {
                console.log("[Settings] Clearing liked cards...");
                 if (typeof window.clearAllLikes === 'function') {
                     window.clearAllLikes(); // Call function from db-likes.js
                      dispatchSettingChangeEvent('likesCleared', true); // Notify app to update UI
                      alert("Liked cards data has been cleared.");
                 } else {
                      console.error("window.clearAllLikes function not found!");
                      alert("Error: Could not clear liked cards data.");
                 }
            }
        });

        // Attach Modal Listeners
        settingsButton.addEventListener('click', openSettingsModal);
        settingsCloseButton.addEventListener('click', closeSettingsModal);
        settingsModal.addEventListener('click', (event) => { // Close on overlay click
            if (event.target === settingsModal) {
                closeSettingsModal();
            }
        });

        console.log("[Settings] Initialization complete.");
    }

    // --- Run Initialization ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSettings);
    } else {
        initializeSettings();
    }

})(); // End of IIFE