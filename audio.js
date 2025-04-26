// audio.js - Handles background music playback and controls

(function() {
    'use strict';

    // --- Configuration ---
    const playlist = [
        './audio/pocket.mp3',
        './audio/Home Menu.mp3',
        './audio/Wonder Pick.mp3',
        './audio/Home Menu.mp3', 
    ];
    const DEFAULT_VOLUME = 0.2;
    const VOLUME_SLIDER_HIDE_DELAY = 300; // Delay in ms before hiding slider

    // --- Elements ---
    let audioPrompt, audioControlContainer, playPauseButton, nextSongButton, muteButton, volumeContainer, volumeSlider, songNameDisplay;

    // --- State ---
    let audio = null;
    let currentSongIndex = 0;
    let isAudioInitialized = false;
    let isMuted = false;
    let volumeBeforeMute = DEFAULT_VOLUME;
    let volumeHideTimeout = null; // Timeout ID for hiding the slider

    /** Initializes Audio after user interaction */
    function initAudio() {
        if (isAudioInitialized || !audioPrompt) return;
        console.log("[Audio] Initializing...");
        try {
            if (!audio) {
                 audio = new Audio();
                 audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : DEFAULT_VOLUME;
                 audio.loop = false;
                 audio.addEventListener('ended', playNextSong);
                 audio.addEventListener('error', handleAudioError);
                 audio.addEventListener('play', updatePlayPauseIcon);
                 audio.addEventListener('pause', updatePlayPauseIcon);
            }
            playSong(currentSongIndex);
            isAudioInitialized = true;
            audioPrompt.style.display = 'none';
            if(audioControlContainer) audioControlContainer.style.display = 'flex';
            console.log("[Audio] Initialized.");
        } catch (e) {
            console.error("[Audio] Error initializing audio:", e);
            if(audioPrompt) audioPrompt.textContent = "Audio Error";
        }
    }

    /** Plays a song by index */
    function playSong(index) {
         if (!audio || index < 0 || index >= playlist.length) {
              console.warn("[Audio] Invalid song index or audio element:", index);
              return;
         }
         currentSongIndex = index;
         const songPath = playlist[currentSongIndex];
         console.log("[Audio] Playing song:", songPath);
         audio.src = songPath;
         const playPromise = audio.play();
         if (playPromise !== undefined) {
             playPromise.then(_ => updateSongNameDisplay())
                        .catch(error => { console.error("[Audio] Playback failed:", error); updatePlayPauseIcon(); });
         } else { updateSongNameDisplay(); }
    }

     /** Toggles Play/Pause */
     function togglePlayPause() {
          if (!isAudioInitialized) { initAudio(); return; }
          if (audio.paused) { audio.play().catch(e => console.error("Play error:", e)); }
          else { audio.pause(); }
     }

     /** Plays the next song */
     function playNextSong() {
          if (!isAudioInitialized) return;
          let nextIndex = (currentSongIndex + 1) % playlist.length;
          playSong(nextIndex);
     }

     /** Updates the displayed song name */
     function updateSongNameDisplay() {
          if (!songNameDisplay || currentSongIndex < 0 || currentSongIndex >= playlist.length) return;
          const songPath = playlist[currentSongIndex];
          const filename = songPath.substring(songPath.lastIndexOf('/') + 1).replace(/\.[^/.]+$/, "");
          songNameDisplay.textContent = filename;
          songNameDisplay.title = filename;
     }

     /** Toggles Mute/Unmute */
     function toggleMute() {
          if (!isAudioInitialized) return;
          isMuted = !isMuted; audio.muted = isMuted;
          if (isMuted) {
               volumeBeforeMute = audio.volume; if(volumeSlider) volumeSlider.value = 0;
               muteButton.setAttribute('aria-label', 'Unmute');
          } else {
               audio.volume = volumeBeforeMute; if(volumeSlider) volumeSlider.value = volumeBeforeMute;
               muteButton.setAttribute('aria-label', 'Mute');
          }
           updateMuteIcon(isMuted ? 0 : audio.volume);
     }

     /** Updates mute button icon */
     function updateMuteIcon(volume) {
          if (!muteButton) return;
          let iconClass = 'fa-volume-high';
          if (volume <= 0 || isMuted) { iconClass = 'fa-volume-xmark'; }
          else if (volume <= 0.5) { iconClass = 'fa-volume-low'; }
          muteButton.innerHTML = `<i class="fas ${iconClass}"></i>`;
     }

      /** Updates play/pause button icon */
     function updatePlayPauseIcon() {
          if (!playPauseButton) return;
          if (audio.paused) { playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; playPauseButton.setAttribute('aria-label', 'Play'); }
          else { playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; playPauseButton.setAttribute('aria-label', 'Pause'); }
     }

     /** Handles audio errors */
     function handleAudioError(e) {
          console.error("[Audio] Error:", e);
          if(songNameDisplay) songNameDisplay.textContent = "Audio Error";
          updatePlayPauseIcon();
     }

    // --- Functions to show/hide volume slider with delay ---
    function showVolumeSlider() {
        if (!volumeContainer) return;
        clearTimeout(volumeHideTimeout); // Cancel any pending hide
        volumeContainer.style.display = 'block';
    }

    function startHideVolumeSlider() {
        if (!volumeContainer) return;
        clearTimeout(volumeHideTimeout); // Clear previous timeout
        volumeHideTimeout = setTimeout(() => {
            volumeContainer.style.display = 'none';
        }, VOLUME_SLIDER_HIDE_DELAY); // Hide after delay
    }

    // --- Initialization ---
    function initializeAudioControls() {
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
            console.error("[Audio] Could not find all required audio control elements."); return;
        }

        // Set initial slider value
        volumeSlider.value = DEFAULT_VOLUME;

        // Add Event Listeners
        audioPrompt.addEventListener('click', initAudio);
        document.body.addEventListener('click', initAudio, { once: true });
        playPauseButton.addEventListener('click', togglePlayPause);
        nextSongButton.addEventListener('click', playNextSong);
        muteButton.addEventListener('click', toggleMute);

        // --- MODIFIED: Volume Slider Interaction with Delay ---
        muteButton.addEventListener('mouseenter', showVolumeSlider);
        muteButton.addEventListener('mouseleave', startHideVolumeSlider); // Start hide timer
        volumeContainer.addEventListener('mouseenter', showVolumeSlider); // Keep open if mouse enters container
        volumeContainer.addEventListener('mouseleave', startHideVolumeSlider); // Start hide timer when leaving container

        volumeSlider.addEventListener('input', (e) => {
             if (!isAudioInitialized) return;
             const newVolume = parseFloat(e.target.value);
             audio.volume = newVolume;
             if (newVolume > 0 && isMuted) { isMuted = false; audio.muted = false; muteButton.setAttribute('aria-label', 'Mute'); }
             else if (newVolume <= 0 && !isMuted) { isMuted = true; audio.muted = true; muteButton.setAttribute('aria-label', 'Unmute'); }
             volumeBeforeMute = newVolume; updateMuteIcon(newVolume);
        });
    }

    // Wait for DOM content to initialize controls
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeAudioControls); }
    else { initializeAudioControls(); }

})();
