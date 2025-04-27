// audio.js - Handles background music playback and controls

(function() {
     'use strict';
 
     // --- Configuration ---
     const playlist = [
         './audio/Background1.mp3',
         './audio/Background2.mp3', // Added a placeholder for a second track
         // Add more tracks here
     ];
     const DEFAULT_VOLUME = 0.2;
     const VOLUME_SLIDER_HIDE_DELAY = 300; // Delay in ms before hiding slider
     const STORAGE_PREFIX = 'fortePreviewerSettings_'; // Match settings.js
     const SETTINGS_KEY = `${STORAGE_PREFIX}all`;     // Match settings.js
 
     // --- Elements ---
     let audioPrompt, audioControlContainer, playPauseButton, nextSongButton, muteButton, volumeContainer, volumeSlider, songNameDisplay;
 
     // --- State ---
     let audio = null;
     let currentSongIndex = 0;
     let isAudioInitialized = false; // Means the Audio object is created and listeners attached
     let isMuted = false; // Local track of mute state (used mainly by toggle)
     let volumeBeforeMute = DEFAULT_VOLUME;
     let volumeHideTimeout = null;
     let autoplayEnabled = false; // Default, loaded from settings
     let userHasInteracted = false; // Track if user has interacted to allow audio context/autoplay
 
     /** Loads autoplay setting from localStorage */
     function loadAudioSettings() {
         try {
             const storedSettings = localStorage.getItem(SETTINGS_KEY);
             if (storedSettings) {
                 const settings = JSON.parse(storedSettings);
                 // Default to false if missing or not explicitly true
                 autoplayEnabled = settings.musicAutoplay === true;
                 console.log("[Audio] Autoplay setting loaded:", autoplayEnabled);
             } else {
                  autoplayEnabled = false; // Explicitly false if no settings found
                  console.log("[Audio] No settings found, autoplay disabled.");
             }
         } catch (e) {
             console.error("[Audio] Error loading settings, autoplay disabled:", e);
             autoplayEnabled = false;
         }
     }
 
     /** Initializes Audio object after first user interaction */
     function handleUserInteraction() {
         // Only run once on first interaction (click or keydown)
         if (userHasInteracted || !audioPrompt) return;
         userHasInteracted = true;
         // Remove the listeners now that interaction occurred
         document.body.removeEventListener('click', handleUserInteraction);
         document.body.removeEventListener('keydown', handleUserInteraction);
         console.log("[Audio] User interaction detected.");
         initAudio(); // Proceed with audio object initialization
     }
 
 
     /** Initializes Audio Object and potentially starts playback based on settings */
     function initAudio() {
         // Ensure user interaction happened and not already initialized
         if (isAudioInitialized || !audioPrompt || !userHasInteracted) return;
 
         console.log("[Audio] Initializing audio object...");
         try {
             if (!audio) {
                 audio = new Audio();
                 // Set initial volume from slider or default BEFORE loading src
                 audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : DEFAULT_VOLUME;
                 audio.muted = isMuted; // Set initial muted state (should be false)
                 audio.loop = false; // Play next song instead of looping
                 audio.addEventListener('ended', playNextSong);
                 audio.addEventListener('error', handleAudioError);
                 audio.addEventListener('play', updatePlayPauseIcon);
                 audio.addEventListener('pause', updatePlayPauseIcon);
                 audio.addEventListener('volumechange', () => { // Keep mute icon sync'd
                     // Update icon based on current volume and muted state
                     if (audio) updateMuteIcon(audio.muted ? 0 : audio.volume);
                 });
             }
 
             // Load the first song but don't play yet unless autoplay is enabled
             currentSongIndex = 0; // Start from the beginning
             if (playlist.length > 0) {
                  // Preload metadata to show name - doesn't start download fully usually
                  audio.preload = 'metadata';
                  audio.src = playlist[currentSongIndex];
                  updateSongNameDisplay(); // Show song name even if not playing yet
             } else {
                  console.warn("[Audio] Playlist is empty.");
                  if(songNameDisplay) songNameDisplay.textContent = "No Songs";
                  // Disable buttons if playlist is empty
                  if(playPauseButton) playPauseButton.disabled = true;
                  if(nextSongButton) nextSongButton.disabled = true;
             }
 
             isAudioInitialized = true; // Mark as initialized
             audioPrompt.style.display = 'none';
             if (audioControlContainer) audioControlContainer.style.display = 'flex';
 
             // Check autoplay setting AFTER initializing everything else
             if (autoplayEnabled && playlist.length > 0) {
                  console.log("[Audio] Autoplay enabled, attempting playback...");
                  // We call playSong which handles loading and playing
                  playSong(currentSongIndex).catch(()=>{ /* Error handled in playSong */ });
             } else {
                  console.log("[Audio] Autoplay disabled or empty playlist, load complete.");
                  // Ensure icons are correct for non-autoplay state
                  updatePlayPauseIcon(); // Should show 'play' icon
                  updateMuteIcon(audio.volume); // Should show correct volume icon
             }
 
             console.log("[Audio] Initialization sequence complete.");
 
         } catch (e) {
             console.error("[Audio] Error initializing audio object:", e);
             if(audioPrompt) audioPrompt.textContent = "Audio Error";
             isAudioInitialized = false; // Reset flag on error
         }
     }
 
     /** Loads and Plays a song by index */
     function playSong(index) {
          if (!audio || index < 0 || index >= playlist.length) {
              console.warn("[Audio] Invalid song index or audio element:", index);
              return Promise.reject("Invalid index or audio element");
          }
          // Can only play if user interaction has happened (audio context allowed)
          if (!isAudioInitialized && !userHasInteracted) {
              console.warn("[Audio] Cannot play song: User interaction required first.");
              return Promise.reject("User interaction required");
          }
          // If called before initAudio finishes (e.g., rapid clicks), wait briefly? Or rely on initAudio.
          // For simplicity, assume initAudio has run if userHasInteracted is true.
 
          currentSongIndex = index;
          const songPath = playlist[currentSongIndex];
          console.log(`[Audio] Setting src and playing index ${index}: ${songPath}`);
 
          // Set src and then play. Browsers usually handle this well.
          audio.src = songPath;
          updateSongNameDisplay(); // Update name immediately
 
          // Return the play promise for potential chaining or error handling
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              return playPromise.catch(error => {
                  console.error(`[Audio] Playback failed for ${songPath}:`, error);
                  // Log error but don't automatically skip here, let 'ended' or user handle next action
                  updatePlayPauseIcon(); // Ensure icon reflects paused state
                  throw error; // Re-throw error
              });
          } else {
               console.warn("[Audio] audio.play() did not return a promise (older browser?). Assuming playback started.");
               updatePlayPauseIcon(); // Manually update icon if no promise
               return Promise.resolve();
          }
     }
 
     /** Toggles Play/Pause */
     function togglePlayPause() {
         // If user hasn't interacted yet, trigger the initialization flow
         if (!userHasInteracted) { handleUserInteraction(); return; }
         // If initialization hasn't finished yet, or audio failed, do nothing more
         if (!isAudioInitialized || !audio) { console.warn("[Audio] Cannot toggle play/pause: Audio not ready."); return; }
 
         if (audio.paused) {
              // If src isn't set (e.g., error) or we're at the end, try playing current/first song
              if (!audio.currentSrc || audio.ended) {
                  console.log("[Audio] Attempting to play from start/current index.");
                   playSong(currentSongIndex).catch(()=>{}); // Ignore promise rejection here
              } else {
                  // Otherwise, just resume
                 audio.play().catch(e => console.error("[Audio] Resume play error:", e));
              }
         }
         else {
             audio.pause();
         }
         // Icon update is handled by the 'play'/'pause' event listeners on the audio element
     }
 
     /** Plays the next song in the playlist */
     function playNextSong() {
         // Can only play if initialized and playlist has items
         if (!isAudioInitialized || !audio || playlist.length === 0) return;
 
         console.log("[Audio] Song ended or next requested.");
         // Calculate next index, wrapping around
         let nextIndex = (currentSongIndex + 1) % playlist.length;
         playSong(nextIndex).catch(() => {
              // Handle potential error playing next song
              console.error(`[Audio] Failed to play next song index ${nextIndex}. Stopping playback.`);
              audio.pause(); // Ensure it's paused
              updatePlayPauseIcon(); // Update icon
         });
     }
 
     /** Updates the displayed song name */
     function updateSongNameDisplay() {
         if (!songNameDisplay || playlist.length === 0) return;
         // Ensure currentSongIndex is valid even if called before src is set
         const indexToDisplay = (currentSongIndex >= 0 && currentSongIndex < playlist.length) ? currentSongIndex : 0;
         const songPath = playlist[indexToDisplay];
         if (!songPath) { songNameDisplay.textContent = "No Song"; return; }
 
         try {
              const decodedPath = decodeURIComponent(songPath);
              const filename = decodedPath.substring(decodedPath.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, "");
              songNameDisplay.textContent = filename;
              songNameDisplay.title = filename;
         } catch (e) {
              console.error("[Audio] Error decoding/parsing song path:", songPath, e);
              songNameDisplay.textContent = "Unknown Song";
         }
     }
 
     /** Toggles Mute/Unmute */
     function toggleMute() {
         if (!isAudioInitialized || !audio) return;
 
         isMuted = !isMuted; // Toggle local state tracker
         audio.muted = isMuted; // Apply to audio element (triggers 'volumechange')
 
         if (isMuted) {
              // Only store volume if it wasn't already 0
              if (audio.volume > 0) {
                  volumeBeforeMute = audio.volume;
              }
              // Don't change audio.volume, just muted state
             if(volumeSlider) volumeSlider.value = 0; // Reflect mute on slider
             muteButton.setAttribute('aria-label', 'Unmute');
             console.log(`[Audio] Muted. Volume stored: ${volumeBeforeMute}`);
         } else {
              // Restore volume only if it was previously > 0
             const restoreVolume = (volumeBeforeMute > 0) ? volumeBeforeMute : DEFAULT_VOLUME;
             audio.volume = restoreVolume; // Setting volume also unmutes implicitly if muted was true
             if(volumeSlider) volumeSlider.value = restoreVolume;
             muteButton.setAttribute('aria-label', 'Mute');
              console.log(`[Audio] Unmuted. Volume restored to: ${restoreVolume}`);
         }
         // Icon update is now primarily handled by the 'volumechange' event listener
     }
 
     /** Updates mute button icon based on volume and muted state*/
     function updateMuteIcon(volume) {
         if (!muteButton || !audio) return;
         let iconClass = 'fa-volume-high'; // Default high volume icon
 
         // Determine icon based on muted state first, then volume level
         if (audio.muted || volume <= 0) {
             iconClass = 'fa-volume-xmark'; // Muted or zero volume
         } else if (volume <= 0.5) {
             iconClass = 'fa-volume-low'; // Low volume
         }
         // else: stays 'fa-volume-high'
 
         // Update icon using innerHTML or modifying classList
          const iconElement = muteButton.querySelector('i');
          if (iconElement) {
              iconElement.className = `fas ${iconClass}`; // Update existing icon's class
          } else {
              // Fallback if icon element somehow missing
              muteButton.innerHTML = `<i class="fas ${iconClass}"></i>`;
          }
     }
 
     /** Updates play/pause button icon based on audio.paused state */
     function updatePlayPauseIcon() {
         if (!playPauseButton || !audio) return; // Check audio element too
          const iconElement = playPauseButton.querySelector('i');
          if (!iconElement) { // Ensure icon exists
               playPauseButton.innerHTML = `<i class="fas fa-play"></i>`;
               playPauseButton.setAttribute('aria-label', 'Play');
               return;
          }
 
         // Set icon based on paused state
         if (audio.paused) {
             iconElement.className = 'fas fa-play';
             playPauseButton.setAttribute('aria-label', 'Play');
         } else {
             iconElement.className = 'fas fa-pause';
             playPauseButton.setAttribute('aria-label', 'Pause');
         }
     }
 
     /** Handles audio playback errors */
     function handleAudioError(e) {
         console.error("[Audio] Playback Error Event:", e);
         if(songNameDisplay) songNameDisplay.textContent = "Audio Error";
         updatePlayPauseIcon(); // Show play icon as it likely stopped/failed
         // Consider stopping completely or trying next song after delay
         // setTimeout(playNextSong, 2000); // Example: Try next after 2s
     }
 
     // --- Volume Slider Show/Hide ---
     function showVolumeSlider() {
         if (!volumeContainer) return;
         clearTimeout(volumeHideTimeout);
         volumeContainer.style.display = 'block'; // Or 'flex' if needed
     }
 
     function startHideVolumeSlider() {
         if (!volumeContainer) return;
         clearTimeout(volumeHideTimeout);
         volumeHideTimeout = setTimeout(() => {
             volumeContainer.style.display = 'none';
         }, VOLUME_SLIDER_HIDE_DELAY);
     }
 
     // --- Initialization ---
     function initializeAudioControls() {
         console.log("[Audio] Initializing Controls...");
         // Get elements
         audioPrompt = document.getElementById('audio-prompt');
         audioControlContainer = document.getElementById('audio-control-container');
         playPauseButton = document.getElementById('play-pause-button');
         nextSongButton = document.getElementById('next-song-button');
         muteButton = document.getElementById('mute-button');
         volumeContainer = document.getElementById('volume-container');
         volumeSlider = document.getElementById('volume-slider');
         songNameDisplay = document.getElementById('song-name');
 
         if (!audioPrompt || !audioControlContainer || !playPauseButton || !nextSongButton || !muteButton || !volumeContainer || !volumeSlider || !songNameDisplay) {
             console.error("[Audio] Could not find all required audio control elements. Audio disabled.");
             if(audioPrompt) audioPrompt.textContent = "Audio Controls Missing!";
             return; // Stop initialization
         }
 
         // Load autoplay setting *before* adding interaction listeners
         loadAudioSettings();
 
         // Set initial slider value and state variables
         volumeSlider.value = DEFAULT_VOLUME;
         volumeBeforeMute = DEFAULT_VOLUME;
         isMuted = false; // Start unmuted
 
         // Set initial icon states before any interaction
         updatePlayPauseIcon(); // Should show 'play' initially
         updateMuteIcon(DEFAULT_VOLUME); // Show volume based on default
 
         // Add Event Listeners
         // Use body click/keydown for initial user interaction detection
         document.body.addEventListener('click', handleUserInteraction, { once: true });
         document.body.addEventListener('keydown', handleUserInteraction, { once: true });
 
         playPauseButton.addEventListener('click', togglePlayPause);
         nextSongButton.addEventListener('click', playNextSong);
         muteButton.addEventListener('click', toggleMute);
 
         // Volume Slider Hover Logic
         muteButton.addEventListener('mouseenter', showVolumeSlider);
         muteButton.addEventListener('mouseleave', startHideVolumeSlider);
         volumeContainer.addEventListener('mouseenter', showVolumeSlider); // Keep slider open if entered
         volumeContainer.addEventListener('mouseleave', startHideVolumeSlider); // Hide when leaving slider itself
 
         // Volume Slider Input Logic
         volumeSlider.addEventListener('input', (e) => {
              if (!audio) return; // Only act if audio object exists
              const newVolume = parseFloat(e.target.value);
              audio.volume = newVolume; // Update volume
 
              // If user sets volume > 0, implicitly unmute
              if (newVolume > 0 && audio.muted) {
                   isMuted = false;
                   audio.muted = false; // This triggers 'volumechange' event -> updates icon
                   muteButton.setAttribute('aria-label', 'Mute');
                   console.log("[Audio] Unmuted via volume slider.");
              }
              // If user sets volume == 0, should we auto-mute? Optional. Mute button is clearer.
              // Let's just update volumeBeforeMute if we are not currently muted
               if (!audio.muted) {
                   volumeBeforeMute = newVolume;
               }
              // Icon update now primarily handled by 'volumechange' listener on audio element
         });
 
         // Listen for setting changes from settings.js
         document.addEventListener('forteSettingChanged', (event) => {
             if (event.detail.setting === 'musicAutoplay') {
                 console.log("[Audio] Received autoplay setting update via event:", event.detail.value);
                 autoplayEnabled = event.detail.value === true;
                 // Autoplay logic is handled during initAudio based on user interaction
             }
         });
 
         console.log("[Audio] Control listeners attached. Waiting for user interaction...");
     }
 
     // Wait for DOM content to initialize controls
     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', initializeAudioControls);
     } else {
         initializeAudioControls(); // DOM already loaded
     }
 })();