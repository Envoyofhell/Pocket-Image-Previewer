// background.js - Optimized Three.js Particle Background Script (v2)
// Includes Page Visibility API pausing and debounced resize.
// Supports 3 visual states: 'normal', 'rave', 'techno'

(function() {
    'use strict';

    try {
        if (typeof THREE === 'undefined') {
            console.error("Three.js library not loaded. Background cannot be initialized.");
            return;
        }

        // --- Variable Declarations ---
        let scene, camera, renderer;
        let container, HEIGHT, WIDTH, fieldOfView, aspectRatio, nearPlane, farPlane;
        let geometry, particleCount, i, materials = [], mouseX = 0, mouseY = 0;
        let windowHalfX, windowHalfY, cameraZ, fogHex, fogDensity, parameters = {}, parameterCount, particles;
        let rafId = null;
        let backgroundState = 'normal';
        let isPaused = false; // External pause control
        let isHidden = document.hidden; // Internal pause for page visibility
        const clock = new THREE.Clock();
        let resizeTimeout; // For debouncing resize

        // --- Configuration Constants (Optimized) ---
        const BACKGROUND_COLOR = 0x0a0514;
        const FOG_COLOR = 0x0a0514;
        const FOG_DENSITY = 0.001;
        // *** Optimization 1: Reduced Particle Count (Adjust further if needed) ***
        const PARTICLE_COUNT = 5000; // Further reduced from 8000
        const RESIZE_DEBOUNCE_MS = 250; // Debounce resize handler

        // Parameters remain the same for visual consistency
        const PARTICLE_PARAMS_NORMAL = [
            [[0.95, 0.7, 0.35], 4], [[0.80, 0.7, 0.32], 3.5], [[0.0, 0.7, 0.32], 3.5],
            [[0.85, 0.6, 0.30], 3], [[0.98, 0.6, 0.30], 3]
        ];
        const PARTICLE_PARAMS_RAVE = [
            [[0.95, 0.9, 0.70], 4.5], [[0.80, 0.9, 0.65], 4], [[0.0, 0.9, 0.65], 4],
            [[0.85, 0.8, 0.60], 3.5], [[0.98, 0.8, 0.60], 3.5]
        ];
        const PARTICLE_PARAMS_TECHNO = [
            [[1.0, 0.8], 4.5], [[1.0, 0.7], 3.5], [[0.9, 0.8], 4.0],
            [[1.0, 0.7], 4.0], [[0.8, 0.8], 3.0]
        ];

        const CAMERA_Z = 1000;
        const ROTATION_SPEED_NORMAL = 0.00004;
        const ROTATION_SPEED_RAVE = 0.00014;
        const ROTATION_SPEED_TECHNO = 0.0004;
        const BREATHING_INTENSITY = 40;
        const BREATHING_SPEED = 0.00015;
        const CAMERA_FOLLOW_SPEED = 0.02;

        // --- Global Pause Control ---
        window.setBackgroundPaused = function(paused) {
            isPaused = paused;
            console.log("Background animation external pause:", isPaused);
            handleAnimationState(); // Check if animation should run/stop
        };

        // --- Page Visibility Handling ---
        function handleVisibilityChange() {
            isHidden = document.hidden;
            console.log("Background visibility changed. Hidden:", isHidden);
            handleAnimationState(); // Check if animation should run/stop
        }

        // --- Animation State Control ---
        function handleAnimationState() {
            const shouldBeRunning = !isPaused && !isHidden;
            if (shouldBeRunning && !rafId) {
                // Start or resume animation
                console.log("Resuming animation loop.");
                clock.getDelta(); // Reset delta on resume
                rafId = requestAnimationFrame(animate);
            } else if (!shouldBeRunning && rafId) {
                // Stop animation
                console.log("Pausing animation loop.");
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        /** Initializes the Three.js environment. */
        function initThreeJS() {
            container = document.getElementById('threejs-bg');
            if (!container) { console.error("Three.js container #threejs-bg not found."); return; }

            // Setup dimensions, camera, scene, geometry, materials...
            // (Code is the same as the previous version until renderer initialization)
            HEIGHT = window.innerHeight; WIDTH = window.innerWidth;
            windowHalfX = WIDTH / 2; windowHalfY = HEIGHT / 2;
            fieldOfView = 75; aspectRatio = WIDTH / HEIGHT; nearPlane = 1; farPlane = 3000;
            cameraZ = CAMERA_Z; fogHex = FOG_COLOR; fogDensity = FOG_DENSITY;

            camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
            camera.position.z = cameraZ;
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(fogHex, fogDensity);

            geometry = new THREE.BufferGeometry();
            const positions = [];
            particleCount = PARTICLE_COUNT;
            for (i = 0; i < particleCount; i++) {
                let radius = Math.random() * 2000;
                let theta = Math.random() * Math.PI * 2;
                let phi = Math.random() * Math.PI;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
                positions.push(x, y, z);
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            parameters = PARTICLE_PARAMS_NORMAL;
            parameterCount = parameters.length;
            materials = [];
            for (i = 0; i < parameterCount; i++) {
                const size = parameters[i][1];
                materials[i] = new THREE.PointsMaterial({
                    size: size, sizeAttenuation: true, vertexColors: false,
                    blending: THREE.AdditiveBlending, transparent: true,
                    opacity: 0.8, depthWrite: false
                });
                particles = new THREE.Points(geometry, materials[i]);
                particles.rotation.x = Math.random() * Math.PI * 2;
                particles.rotation.y = Math.random() * Math.PI * 2;
                particles.rotation.z = Math.random() * Math.PI * 2;
                scene.add(particles);
            }

            // Initialize renderer
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
            renderer.setSize(WIDTH, HEIGHT);
            renderer.setClearColor(BACKGROUND_COLOR, 1);
            container.appendChild(renderer.domElement);

            // --- Event Listeners ---
            window.addEventListener('resize', handleResize, false); // Use debounced handler
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, { passive: true });
            document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });
            document.addEventListener('visibilitychange', handleVisibilityChange, false); // Listen for tab visibility changes

            document.addEventListener('background-state-change', (e) => {
                const newState = e.detail.state;
                if (['normal', 'rave', 'techno'].includes(newState)) {
                    backgroundState = newState;
                } else {
                    backgroundState = 'normal';
                }
            });

            handleAnimationState(); // Initial check to start animation if needed
            console.log("Optimized Three.js background (v2) initialized.");
        }

        /** Animation loop ticker. */
        function animate() {
            // The handleAnimationState function now controls starting/stopping
            rafId = requestAnimationFrame(animate);
            renderThreeJS();
        }

        /** Renders a single frame. */
        function renderThreeJS() {
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            let currentRotationSpeed;
            let currentParams;
            let rotationMultiplier;
            let followSpeed = CAMERA_FOLLOW_SPEED;

            switch (backgroundState) {
                case 'rave':
                    currentRotationSpeed = ROTATION_SPEED_RAVE;
                    currentParams = PARTICLE_PARAMS_RAVE;
                    rotationMultiplier = 12;
                    followSpeed = 0.03;
                    break;
                case 'techno':
                    currentRotationSpeed = ROTATION_SPEED_TECHNO;
                    currentParams = PARTICLE_PARAMS_TECHNO;
                    rotationMultiplier = 30;
                    followSpeed = 0.04;
                    break;
                case 'normal':
                default:
                    currentRotationSpeed = ROTATION_SPEED_NORMAL;
                    currentParams = PARTICLE_PARAMS_NORMAL;
                    rotationMultiplier = 1;
                    followSpeed = 0.02;
                    break;
            }
            const time = elapsedTime * currentRotationSpeed * 1000;

            // Animate camera
            const lerpFactor = 1.0 - Math.pow(0.01, delta);
            camera.position.x += (mouseX - camera.position.x) * lerpFactor;
            camera.position.y += (-mouseY - camera.position.y) * lerpFactor;
            camera.position.z = cameraZ + Math.sin(Date.now() * BREATHING_SPEED) * BREATHING_INTENSITY;
            camera.lookAt(scene.position);

            // Animate particle systems rotation
            parameterCount = currentParams.length;
            for (i = 0; i < scene.children.length; i++) {
                const object = scene.children[i];
                if (object instanceof THREE.Points) {
                    object.rotation.y = time * rotationMultiplier * (i < (parameterCount / 2) ? i + 1 : -(i + 1));
                }
            }

            // Animate materials
            for (i = 0; i < materials.length; i++) {
                const material = materials[i];
                const paramIndex = i % parameterCount;

                if (backgroundState === 'techno') {
                    const technoParams = currentParams[paramIndex][0];
                    const baseSize = currentParams[paramIndex][1];
                    const technoSat = technoParams[0];
                    const technoLight = technoParams[1];
                    let h = (elapsedTime * 2.0 + i * 0.2) % 1;
                    material.color.setHSL(h, technoSat, technoLight);
                    material.opacity = 0.95;
                    material.size = baseSize;
                } else {
                    const normalRaveParams = currentParams[paramIndex][0];
                    const baseSize = currentParams[paramIndex][1];
                    const baseH = normalRaveParams[0];
                    const baseS = normalRaveParams[1];
                    const baseL = normalRaveParams[2];
                    const hueSpeed = backgroundState === 'rave' ? 1.0 : 0.5;
                    let h_norm_rave = baseH + Math.sin(elapsedTime * hueSpeed + i * Math.PI) * 0.1;
                    h_norm_rave = (h_norm_rave + 1) % 1;
                    material.color.setHSL(h_norm_rave, baseS, baseL);
                    material.opacity = backgroundState === 'rave' ? 0.9 : 0.8;
                    material.size = baseSize;
                }
            }

            // Render the scene
            if (renderer) { renderer.render(scene, camera); }
        }

        // --- Event Handlers ---
        function onDocumentMouseMove(e) {
            mouseX = e.clientX - windowHalfX;
            mouseY = e.clientY - windowHalfY;
        }
        function onDocumentTouchStart(e) {
            if (e.touches.length === 1) {
                mouseX = e.touches[0].pageX - windowHalfX;
                mouseY = e.touches[0].pageY - windowHalfY;
            }
        }
        function onDocumentTouchMove(e) {
            if (e.touches.length === 1) {
                mouseX = e.touches[0].pageX - windowHalfX;
                mouseY = e.touches[0].pageY - windowHalfY;
            }
        }

        // --- Debounced Resize Handler ---
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Debounced resize executing...");
                try {
                    WIDTH = window.innerWidth; HEIGHT = window.innerHeight;
                    windowHalfX = WIDTH / 2; windowHalfY = HEIGHT / 2;
                    if(camera){
                        camera.aspect = WIDTH / HEIGHT;
                        camera.updateProjectionMatrix();
                    }
                    if (renderer) {
                        renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
                        renderer.setSize(WIDTH, HEIGHT);
                    }
                } catch(e) { console.error("Error on debounced window resize:", e); }
            }, RESIZE_DEBOUNCE_MS); // Wait 250ms after resize stops
        }

        // --- Initialize ---
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initThreeJS);
        } else {
            initThreeJS();
        }

        // --- Cleanup ---
        window.addEventListener('unload', () => {
             if (rafId) cancelAnimationFrame(rafId);
             window.removeEventListener('resize', handleResize); // Remove debounced handler
             document.removeEventListener('mousemove', onDocumentMouseMove);
             document.removeEventListener('touchstart', onDocumentTouchStart);
             document.removeEventListener('touchmove', onDocumentTouchMove);
             document.removeEventListener('visibilitychange', handleVisibilityChange); // Remove visibility listener
             // Remove custom event listener if needed

             // Dispose of Three.js resources
             // (Same disposal code as previous version)
             if (scene) {
                 while(scene.children.length > 0){
                     const object = scene.children[0];
                     if (object.geometry) object.geometry.dispose();
                     if (object.material) {
                         if (Array.isArray(object.material)) {
                             object.material.forEach(material => material.dispose());
                         } else {
                             object.material.dispose();
                         }
                     }
                     scene.remove(object);
                 }
             }
             if (geometry) geometry.dispose();
             materials.forEach(material => material.dispose());
             if (renderer) {
                 renderer.dispose();
                 if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                 }
             }
             console.log("Optimized Three.js background (v2) cleaned up.");
        });

    // Catch top-level errors
    } catch (e) {
        console.error("Error in Three.js background script:", e);
        const bgContainer = document.getElementById('threejs-bg');
        if (bgContainer) bgContainer.style.background = '#111';
    }
})(); // End of IIFE
