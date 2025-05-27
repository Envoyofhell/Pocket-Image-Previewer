// db-likes.js - Cloudflare D1 Database Integration for card likes
// This script handles interactions with Cloudflare D1 SQL database for storing card likes

(function() {
    'use strict';

    // --- Constants ---
    const API_ENDPOINT = '/api/likes'; // Endpoint for the Cloudflare Worker
    const SESSION_ID_KEY = 'forte_session_id';    // For sessionStorage
    const MAX_USER_LIKES_PER_DAY = 10;            // Limit likes per day per user/device

    // --- State ---
    let cardLikes = {}; // Card path -> {count: number, userLiked: boolean}
    let currentSessionId = null;
    let userLikesCount = 0;
    let isInitialized = false;

    // --- Initialize Global Functions Early ---
    // These functions will be replaced with real implementations after initialization
    window.getLikeData = function(cardPath) {
        if (!cardPath) return { count: 0, liked: false };
        const cachedData = cardLikes[cardPath] || { count: 0, userLiked: false };
        return { 
            count: cachedData.count || 0, 
            liked: cachedData.userLiked || false 
        };
    };

    window.toggleLike = function(cardPath) {
        if (!cardPath || !isInitialized) return false;
        
        // Get current state
        const currentState = window.getLikeData(cardPath);
        const isLiked = currentState.liked;
        
        // If we're trying to like and already at the limit, prevent it
        if (!isLiked && userLikesCount >= MAX_USER_LIKES_PER_DAY) {
            console.log(`Like limit reached (${MAX_USER_LIKES_PER_DAY} per day)`);
            return false;
        }

        // Optimistically update the state
        if (!cardLikes[cardPath]) {
            cardLikes[cardPath] = { count: 0, userLiked: false };
        }
        
        // Toggle the like state
        if (isLiked) {
            cardLikes[cardPath].count = Math.max(0, cardLikes[cardPath].count - 1);
            cardLikes[cardPath].userLiked = false;
            userLikesCount = Math.max(0, userLikesCount - 1);
            console.log(`Unliked card: ${cardPath}, new count: ${cardLikes[cardPath].count}`);
        } else {
            cardLikes[cardPath].count++;
            cardLikes[cardPath].userLiked = true;
            userLikesCount++;
            console.log(`Liked card: ${cardPath}, new count: ${cardLikes[cardPath].count}`);
        }
        
        // Make the API call to update the database
        updateLikeInDatabase(cardPath, !isLiked);
        
        // Also save to localStorage as backup for local testing
        try {
            localStorage.setItem('forte_card_likes', JSON.stringify({
                cardLikes: cardLikes,
                userLikesCount: userLikesCount
            }));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
        
        return !isLiked; // Return the new liked state
    };
    
    window.getUserLikeCount = function() {
        return userLikesCount;
    };

    // Function to clear all likes (called from settings)
    window.clearAllLikes = function() {
        cardLikes = {};
        userLikesCount = 0;
        
        // Clear from localStorage as fallback
        try {
            localStorage.removeItem('forte_card_likes');
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
        
        // Refresh UI
        if (window.ForteGallery && window.ForteGallery.refreshLikeButtons) {
            window.ForteGallery.refreshLikeButtons();
        }
        
        // Update lightbox if open
        const lightboxLikeButton = document.getElementById('fancy-like-button');
        if (lightboxLikeButton && window.ForteLightbox && window.ForteLightbox.getCurrentCard) {
            const currentCard = window.ForteLightbox.getCurrentCard();
            if (currentCard) {
                const cardPath = currentCard.images?.large || currentCard.images?.small || '';
                if (cardPath && window.ForteLightbox.updateLikeButton) {
                    window.ForteLightbox.updateLikeButton(cardPath);
                }
            }
        }
        
        console.log('All likes cleared');
    };

    // --- Initialize ---
    function init() {
        console.log('Initializing Cloudflare D1 Database integration...');
        
        // Generate or retrieve session ID
        ensureSessionId();
        
        // Try to load from localStorage first (for local testing)
        loadFromLocalStorage();
        
        // Initial data load to get like counts for all cards
        loadAllLikes().then(() => {
            isInitialized = true;
            console.log('Like system initialized with database integration');
            
            // Refresh gallery like buttons now that we have the data
            if (window.ForteGallery && window.ForteGallery.refreshLikeButtons) {
                window.ForteGallery.refreshLikeButtons();
                console.log('Refreshed gallery like buttons with database data');
            }
        }).catch(err => {
            console.error('Failed to initialize like system:', err);
            // Fall back to local mode if database connection fails
            fallbackToLocalMode();
        });
    }

    /**
     * Load likes from localStorage (for local testing persistence)
     */
    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('forte_card_likes');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.cardLikes) {
                    cardLikes = data.cardLikes;
                }
                if (data.userLikesCount !== undefined) {
                    userLikesCount = data.userLikesCount;
                }
                console.log('Loaded likes from localStorage for local testing');
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }

    /**
     * Creates a session ID for the current user
     */
    function ensureSessionId() {
        // Try to get existing session ID
        currentSessionId = sessionStorage.getItem(SESSION_ID_KEY);
        
        if (!currentSessionId) {
            // Create a new session ID
            const timestamp = Date.now();
            const randomPart = Math.random().toString(36).substring(2, 10);
            const fingerprint = generateBasicFingerprint();
            
            currentSessionId = `${fingerprint}-${timestamp}-${randomPart}`;
            sessionStorage.setItem(SESSION_ID_KEY, currentSessionId);
            
            console.log('New session initialized');
        }
    }
    
    /**
     * Creates a simple browser fingerprint based on available info
     */
    function generateBasicFingerprint() {
        const browser = navigator.userAgent;
        const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        const languages = navigator.languages ? navigator.languages.join(',') : navigator.language;
        
        // Create a hash from these values
        let fingerprint = browser + screenInfo + timeZone + languages;
        return stringToHash(fingerprint);
    }
    
    /**
     * Converts a string to a hash
     */
    function stringToHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Loads all likes from the database
     */
    async function loadAllLikes() {
        try {
            const response = await fetch(`${API_ENDPOINT}/getAll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: currentSessionId
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Process the card likes
            if (data.cardLikes) {
                cardLikes = data.cardLikes;
            }
            
            // Process user like count
            if (data.userLikeCount !== undefined) {
                userLikesCount = data.userLikeCount;
            }
            
            console.log(`Loaded ${Object.keys(cardLikes).length} card likes and user liked ${userLikesCount} cards`);
            return true;
        } catch (error) {
            console.error('Error loading likes from database:', error);
            throw error;
        }
    }

    /**
     * Updates a like in the database
     */
    async function updateLikeInDatabase(cardPath, isLiking) {
        if (!cardPath || !currentSessionId) return false;
        
        try {
            const response = await fetch(`${API_ENDPOINT}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cardPath: cardPath,
                    sessionId: currentSessionId,
                    action: isLiking ? 'like' : 'unlike'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            
            // Update the local counts with the accurate DB count
            if (result.success && result.newCount !== undefined) {
                if (!cardLikes[cardPath]) {
                    cardLikes[cardPath] = { count: 0, userLiked: false };
                }
                cardLikes[cardPath].count = result.newCount;
                
                console.log(`Card ${cardPath} ${isLiking ? 'liked' : 'unliked'}, new count: ${result.newCount}`);
            } else {
                console.error('Like update failed:', result.message || 'Unknown error');
                // Revert the optimistic update
                revertOptimisticUpdate(cardPath, isLiking);
            }
            
            return result.success;
        } catch (error) {
            console.error('Error updating like in database:', error);
            // Revert the optimistic update
            revertOptimisticUpdate(cardPath, isLiking);
            return false;
        }
    }

    /**
     * Reverts an optimistic update if the API call fails
     */
    function revertOptimisticUpdate(cardPath, wasLiking) {
        if (!cardLikes[cardPath]) return;
        
        // Revert the count
        if (wasLiking) {
            cardLikes[cardPath].count = Math.max(0, cardLikes[cardPath].count - 1);
            cardLikes[cardPath].userLiked = false;
            userLikesCount = Math.max(0, userLikesCount - 1);
        } else {
            cardLikes[cardPath].count++;
            cardLikes[cardPath].userLiked = true;
            userLikesCount++;
        }
    }

    /**
     * Fallback to local storage if database connection fails
     */
    function fallbackToLocalMode() {
        console.log('Falling back to local storage for likes');
        
        // Initialize local storage fallback
        const LIKES_STORAGE_KEY = 'forte_card_likes';
        
        // Try to load from localStorage
        try {
            const storedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
            if (storedLikes) {
                const parsedData = JSON.parse(storedLikes);
                if (parsedData.cardLikes) {
                    cardLikes = parsedData.cardLikes;
                }
                
                // Count user likes
                userLikesCount = 0;
                Object.values(cardLikes).forEach(like => {
                    if (like.userLiked) userLikesCount++;
                });
            }
        } catch (e) {
            console.error('Error loading likes from local storage:', e);
        }
        
        // Replace the toggleLike function with a local storage version
        window.toggleLike = function(cardPath) {
            if (!cardPath) return false;
            
            // Get current state
            const currentState = window.getLikeData(cardPath);
            const isLiked = currentState.liked;
            
            // If we're trying to like and already at the limit, prevent it
            if (!isLiked && userLikesCount >= MAX_USER_LIKES_PER_DAY) {
                console.log(`Like limit reached (${MAX_USER_LIKES_PER_DAY} per day)`);
                return false;
            }
            
            // Update the state
            if (!cardLikes[cardPath]) {
                cardLikes[cardPath] = { count: 0, userLiked: false };
            }
            
            // Toggle the like state
            if (isLiked) {
                cardLikes[cardPath].count = Math.max(0, cardLikes[cardPath].count - 1);
                cardLikes[cardPath].userLiked = false;
                userLikesCount = Math.max(0, userLikesCount - 1);
                console.log(`LocalStorage: Unliked card: ${cardPath}, new count: ${cardLikes[cardPath].count}`);
            } else {
                cardLikes[cardPath].count++;
                cardLikes[cardPath].userLiked = true;
                userLikesCount++;
                console.log(`LocalStorage: Liked card: ${cardPath}, new count: ${cardLikes[cardPath].count}`);
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Trigger UI updates immediately
            setTimeout(() => {
                // Update gallery buttons
                if (window.ForteGallery && window.ForteGallery.refreshLikeButtons) {
                    window.ForteGallery.refreshLikeButtons();
                }
                
                // Update lightbox button if open
                if (window.ForteLightbox && window.ForteLightbox.updateLikeButton) {
                    window.ForteLightbox.updateLikeButton(cardPath);
                }
            }, 10);
            
            return !isLiked;
        };
        
        // Function to save to localStorage
        function saveToLocalStorage() {
            try {
                localStorage.setItem('forte_card_likes', JSON.stringify({
                    cardLikes: cardLikes,
                    userLikesCount: userLikesCount
                }));
                console.log('Saved likes to localStorage:', { cardLikes, userLikesCount });
            } catch (e) {
                console.error('Error saving likes to local storage:', e);
            }
        }
        
        isInitialized = true;
        
        // Refresh gallery like buttons now that we have the data
        if (window.ForteGallery && window.ForteGallery.refreshLikeButtons) {
            window.ForteGallery.refreshLikeButtons();
            console.log('Refreshed gallery like buttons with localStorage data');
        }
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();