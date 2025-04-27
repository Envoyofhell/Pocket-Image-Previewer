// realtime-likes.js - Handles real-time like system with database connection
// Updates likes across all clients viewing the application

(function() {
    'use strict';

    // --- Constants ---
    const API_ENDPOINT = '/api/likes'; // Endpoint for the like API
    const SESSION_ID_KEY = 'forte_session_id'; // For sessionStorage
    const LIKES_STORAGE_KEY = 'forte_card_likes'; // For localStorage fallback
    const MAX_USER_LIKES_PER_DAY = 10; // Limit likes per day per user/device
    const INITIAL_FETCH_RETRY_ATTEMPTS = 3; // Retry initial fetch up to 3 times
    const FETCH_RETRY_DELAY = 1500; // Wait 1.5 seconds between retries
    const FORCE_LOCAL_MODE = false; // Set to true to force local storage mode (testing)

    // --- State ---
    let cardLikes = {}; // Card path -> {count: number, userLiked: boolean}
    let currentSessionId = null;
    let userLikesCount = 0;
    let isInitialized = false;
    let fetchAttempts = 0;
    let isRemoteAvailable = !FORCE_LOCAL_MODE;
    let lastUpdateTime = 0;

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
            showLikeLimitToast();
            return false;
        }

        // Optimistically update the state
        if (!cardLikes[cardPath]) {
            cardLikes[cardPath] = { count: 0, userLiked: false };
        }
        
        // Toggle the like state locally immediately
        if (isLiked) {
            cardLikes[cardPath].count = Math.max(0, cardLikes[cardPath].count - 1);
            cardLikes[cardPath].userLiked = false;
            userLikesCount = Math.max(0, userLikesCount - 1);
        } else {
            cardLikes[cardPath].count++;
            cardLikes[cardPath].userLiked = true;
            userLikesCount++;
        }
        
        // This will trigger a custom event to notify any listeners
        dispatchLikeUpdateEvent(cardPath, !isLiked, cardLikes[cardPath].count);
        
        // Make the API call to update the database - if remote is not available, just save locally
        if (isRemoteAvailable) {
            updateLikeInDatabase(cardPath, !isLiked)
                .catch(err => {
                    console.error('Error updating like:', err);
                    // If remote fails, save locally as backup
                    saveToLocalStorage();
                });
        } else {
            // If in local mode, just save to localStorage
            saveToLocalStorage();
        }
        
        return !isLiked; // Return the new liked state
    };
    
    window.getUserLikeCount = function() {
        return userLikesCount;
    };
    
    // Function to refresh likes data from server
    window.refreshLikesData = async function() {
        if (!isRemoteAvailable) {
            // If in local mode, just load from localStorage
            loadFromLocalStorage();
            return Promise.resolve();
        }
        
        // Don't refresh too often
        const now = Date.now();
        if (now - lastUpdateTime < 5000) { // Wait at least 5 seconds between refreshes
            return Promise.resolve();
        }
        
        lastUpdateTime = now;
        return loadAllLikes();
    };

    // --- Initialize ---
    function init() {
        console.log('Initializing Real-time Likes System...');
        
        // Generate or retrieve session ID
        ensureSessionId();
        
        // Initial data load to get like counts
        initializeWithRetry(INITIAL_FETCH_RETRY_ATTEMPTS);
        
        // Set up event listener for likes from other clients
        setupLikeEventListeners();
    }
    
    /**
     * Tries to initialize with multiple attempts in case of network issues
     */
    function initializeWithRetry(attemptsLeft) {
        loadAllLikes().then(() => {
            isInitialized = true;
            console.log('Real-time Likes System initialized successfully');
        }).catch(err => {
            console.error('Failed to initialize likes system:', err);
            fetchAttempts++;
            
            if (attemptsLeft > 0) {
                console.log(`Retrying initialization (${attemptsLeft} attempts left)...`);
                setTimeout(() => {
                    initializeWithRetry(attemptsLeft - 1);
                }, FETCH_RETRY_DELAY);
            } else {
                // Fall back to local mode if all attempts fail
                console.log('Falling back to local storage mode for likes');
                isRemoteAvailable = false;
                fallbackToLocalMode();
            }
        });
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
     * Set up event listeners for real-time like updates
     */
    function setupLikeEventListeners() {
        // Listen for like events on the window
        window.addEventListener('forte-like-update', function(e) {
            const detail = e.detail;
            if (!detail || !detail.cardPath) return;
            
            // Don't process events from the same session (we already handled it)
            if (detail.sessionId === currentSessionId) return;
            
            console.log('Received like update event:', detail);
            
            // Update our local state with the new like count
            if (!cardLikes[detail.cardPath]) {
                cardLikes[detail.cardPath] = { count: 0, userLiked: false };
            }
            
            // Always use the provided count from the event, as it's the source of truth
            cardLikes[detail.cardPath].count = detail.newCount;
            
            // Trigger UI update by broadcasting a custom event
            const updateEvent = new CustomEvent('forte-likes-refreshed', {
                detail: {
                    cardPath: detail.cardPath,
                    count: detail.newCount
                }
            });
            window.dispatchEvent(updateEvent);
        });
        
        // Listen for our own refresh event to update UI
        window.addEventListener('forte-likes-refreshed', function() {
            // This will update the UI when triggered
            if (typeof updateAllThumbnailLikes === 'function') {
                updateAllThumbnailLikes();
            }
        });
    }
    
    /**
     * Dispatch a like update event for others to receive
     */
    function dispatchLikeUpdateEvent(cardPath, isLiked, newCount) {
        const event = new CustomEvent('forte-like-update', {
            detail: {
                cardPath: cardPath,
                sessionId: currentSessionId,
                isLiked: isLiked,
                newCount: newCount,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
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
            
            // Cache for offline use
            saveToLocalStorage();
            
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
                // Update with the server's count which is the source of truth
                cardLikes[cardPath].count = result.newCount;
                
                // Make sure our liked state is correct 
                cardLikes[cardPath].userLiked = isLiking;
                
                // Dispatch another event with the corrected count for others
                dispatchLikeUpdateEvent(cardPath, isLiking, result.newCount);
                
                // Save to localStorage as backup
                saveToLocalStorage();
                
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
            
            // If we've had consistent failures, switch to local mode
            isRemoteAvailable = false;
            
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
        
        // Dispatch a new event with the reverted state
        dispatchLikeUpdateEvent(cardPath, cardLikes[cardPath].userLiked, cardLikes[cardPath].count);
    }

    /**
     * Fallback to local storage mode
     */
    function fallbackToLocalMode() {
        console.log('Initializing local storage fallback for likes');
        
        // Try to load from localStorage first
        loadFromLocalStorage();
        
        isInitialized = true;
    }
    
    /**
     * Save the current state to localStorage
     */
    function saveToLocalStorage() {
        try {
            localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify({
                cardLikes: cardLikes,
                userLikesCount: userLikesCount,
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Error saving likes to local storage:', e);
        }
    }
    
    /**
     * Load previously saved state from localStorage
     */
    function loadFromLocalStorage() {
        try {
            const storedData = localStorage.getItem(LIKES_STORAGE_KEY);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (parsed.cardLikes) {
                    cardLikes = parsed.cardLikes;
                    console.log(`Loaded ${Object.keys(cardLikes).length} cards from local storage`);
                }
                if (parsed.userLikesCount !== undefined) {
                    userLikesCount = parsed.userLikesCount;
                }
            }
            
            // Calculate user likes if not stored
            if (userLikesCount === 0) {
                let count = 0;
                for (const key in cardLikes) {
                    if (cardLikes[key].userLiked) {
                        count++;
                    }
                }
                userLikesCount = count;
            }
        } catch (e) {
            console.error('Error loading likes from local storage:', e);
        }
    }
    
    /**
     * Display a toast message when user reaches like limit
     */
    function showLikeLimitToast() {
        // Create a toast element if it doesn't exist
        let toast = document.getElementById('like-limit-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'like-limit-toast';
            toast.className = 'like-limit-toast';
            toast.innerHTML = `
                <div class="toast-icon"><i class="fas fa-heart-broken"></i></div>
                <div class="toast-content">
                    <div class="toast-title">Daily Like Limit Reached</div>
                    <div class="toast-message">You've used all ${MAX_USER_LIKES_PER_DAY} of your daily likes. Try again tomorrow!</div>
                </div>
                <button class="toast-close"><i class="fas fa-times"></i></button>
            `;
            document.body.appendChild(toast);
            
            // Add close button handler
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', function() {
                toast.classList.remove('visible');
            });
        }
        
        // Show the toast
        toast.classList.add('visible');
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            toast.classList.remove('visible');
        }, 5000);
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();