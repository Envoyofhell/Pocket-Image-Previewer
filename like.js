// likes.js - Handles card like system with IP-based limitation

(function() {
    'use strict';

    // --- Constants ---
    const LIKES_STORAGE_KEY = 'forte_card_likes'; // For localStorage
    const SESSION_ID_KEY = 'forte_session_id';    // For sessionStorage
    const MAX_USER_LIKES_PER_DAY = 10;            // Limit likes per day per user/device

    // --- State ---
    let cardLikes = {}; // Card path -> {count: number, likedBy: [sessionIds]}
    let userLikes = {}; // sessionId -> [{timestamp: Date, cardPath: string}]
    let currentSessionId = null;

    // --- Initialize ---
    function init() {
        loadLikesFromStorage();
        ensureSessionId();
        
        // Generate fingerprint on first use
        if (!sessionStorage.getItem('forte_fingerprint')) {
            generateFingerprint().then(fingerprint => {
                sessionStorage.setItem('forte_fingerprint', fingerprint);
                console.log('Device fingerprint generated');
            });
        }
        // Near the beginning of likes.js, add these lines before the init() function:
window.getLikeData = function(cardPath) {
    if (!cardPath) return { count: 0, liked: false };
    // Rest of the function can remain the same when initialized
    return { count: 0, liked: false };
};

window.toggleLike = function(cardPath) {
    if (!cardPath) return false;
    // Will be replaced with the real function later
    return false;
};

window.getUserLikeCount = function() {
    // Will be replaced with the real function later
    return 0;
};
        // Initialize global functions
        window.getLikeData = getLikeData;
        window.toggleLike = toggleLike;
        window.getUserLikeCount = getUserLikeCount;
    }

    // --- IP & Browser Fingerprinting ---
    
    /**
     * Creates a session ID for the current user
     * Combines fingerprinting with a timestamp to create a unique session
     */
    function ensureSessionId() {
        // Try to get existing session ID
        currentSessionId = sessionStorage.getItem(SESSION_ID_KEY);
        
        if (!currentSessionId) {
            // Create a new session ID
            const timestamp = Date.now();
            const randomPart = Math.random().toString(36).substring(2, 10);
            
            // Use stored fingerprint if available, otherwise use browser info + timestamp
            const fingerprint = sessionStorage.getItem('forte_fingerprint') || generateBasicFingerprint();
            
            currentSessionId = `${fingerprint}-${timestamp}-${randomPart}`;
            sessionStorage.setItem(SESSION_ID_KEY, currentSessionId);
            
            // Initialize user likes for this session
            userLikes[currentSessionId] = [];
            saveLikesToStorage();
            
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
     * Generates a more comprehensive device fingerprint
     * Uses available browser APIs and hardware info
     */
    async function generateFingerprint() {
        // Start with basic info
        const basicInfo = generateBasicFingerprint();
        
        // Try to add canvas fingerprinting
        let canvasFingerprint = 'nocanvas';
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            
            // Text with custom font/position
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Forte Cards', 2, 15);
            
            // Add a gradient
            const gradient = ctx.createLinearGradient(0, 0, 200, 0);
            gradient.addColorStop(0, 'red');
            gradient.addColorStop(0.5, 'green');
            gradient.addColorStop(1.0, 'blue');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 25, 200, 25);
            
            // Get the data URL and hash it
            canvasFingerprint = canvas.toDataURL();
            canvasFingerprint = stringToHash(canvasFingerprint);
        } catch (e) {
            console.log('Canvas fingerprinting not available');
        }
        
        // Try to add audio fingerprinting
        let audioFingerprint = 'noaudio';
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const oscillator = audioContext.createOscillator();
            const dynamicsCompressor = audioContext.createDynamicsCompressor();
            
            // Configure nodes
            analyser.fftSize = 32;
            
            // Set non-default values
            dynamicsCompressor.threshold.value = -50;
            dynamicsCompressor.knee.value = 40;
            dynamicsCompressor.ratio.value = 12;
            dynamicsCompressor.attack.value = 0;
            dynamicsCompressor.release.value = 0.25;
            
            // Connect nodes
            oscillator.connect(dynamicsCompressor);
            dynamicsCompressor.connect(analyser);
            analyser.connect(audioContext.destination);
            
            // Start oscillator & get frequency data
            oscillator.start(0);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            oscillator.stop(0);
            
            // Convert frequency data to string and hash
            audioFingerprint = stringToHash(dataArray.join(','));
        } catch (e) {
            console.log('Audio fingerprinting not available');
        }
        
        // Combine fingerprints
        const combinedFingerprint = `${basicInfo}-${canvasFingerprint}-${audioFingerprint}`;
        return stringToHash(combinedFingerprint);
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

    // --- Like System Functions ---
    
    /**
     * Gets like data for a specific card
     * Returns count and whether the current user has liked it
     */
    function getLikeData(cardPath) {
        if (!cardPath) return { count: 0, liked: false };
        
        const likeInfo = cardLikes[cardPath] || { count: 0, likedBy: [] };
        const isLiked = likeInfo.likedBy.includes(currentSessionId);
        
        return {
            count: likeInfo.count,
            liked: isLiked
        };
    }
    
    /**
     * Toggles a like for the current user on the specified card
     * Handles like/unlike with proper constraints
     */
    function toggleLike(cardPath) {
        if (!cardPath || !currentSessionId) return false;
        
        // Initialize if first like for this card
        if (!cardLikes[cardPath]) {
            cardLikes[cardPath] = {
                count: 0,
                likedBy: []
            };
        }
        
        // Initialize if first like for this user
        if (!userLikes[currentSessionId]) {
            userLikes[currentSessionId] = [];
        }
        
        const liked = cardLikes[cardPath].likedBy.includes(currentSessionId);
        
        if (liked) {
            // Unlike: remove session from likedBy and decrement count
            cardLikes[cardPath].likedBy = cardLikes[cardPath].likedBy.filter(id => id !== currentSessionId);
            cardLikes[cardPath].count = Math.max(0, cardLikes[cardPath].count - 1);
            
            // Remove from user likes
            userLikes[currentSessionId] = userLikes[currentSessionId].filter(like => like.cardPath !== cardPath);
            
            console.log(`Unliked card: ${cardPath}`);
        } else {
            // Check if user has reached their daily like limit
            const recentLikes = getRecentLikes();
            if (recentLikes.length >= MAX_USER_LIKES_PER_DAY) {
                console.log(`Like limit reached (${MAX_USER_LIKES_PER_DAY} per day)`);
                return false;
            }
            
            // Like: add session to likedBy and increment count
            cardLikes[cardPath].likedBy.push(currentSessionId);
            cardLikes[cardPath].count++;
            
            // Add to user likes
            userLikes[currentSessionId].push({
                timestamp: new Date().toISOString(),
                cardPath: cardPath
            });
            
            console.log(`Liked card: ${cardPath}`);
        }
        
        // Save to storage
        saveLikesToStorage();
        
        return !liked; // Return new like state
    }
    
    /**
     * Returns the number of likes by this user in the last 24 hours
     */
    function getUserLikeCount() {
        return getRecentLikes().length;
    }
    
    /**
     * Gets user likes from the last 24 hours
     */
    function getRecentLikes() {
        if (!userLikes[currentSessionId]) return [];
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        return userLikes[currentSessionId].filter(like => {
            const likeDate = new Date(like.timestamp);
            return likeDate > oneDayAgo;
        });
    }

    // --- Storage Functions ---
    
    /**
     * Loads likes from localStorage
     */
    function loadLikesFromStorage() {
        try {
            const storedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
            if (storedLikes) {
                const parsedData = JSON.parse(storedLikes);
                cardLikes = parsedData.cardLikes || {};
                userLikes = parsedData.userLikes || {};
                console.log('Likes loaded from storage');
            }
        } catch (e) {
            console.error('Error loading likes from storage:', e);
            // Reset to defaults on error
            cardLikes = {};
            userLikes = {};
        }
    }
    
    /**
     * Saves likes to localStorage
     */
    function saveLikesToStorage() {
        try {
            const dataToStore = {
                cardLikes: cardLikes,
                userLikes: userLikes
            };
            localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (e) {
            console.error('Error saving likes to storage:', e);
        }
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();