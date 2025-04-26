// background.js - Three.js Particle Background Script
// Supports 3 visual states: 'normal', 'rave', 'techno'

(function() {
    'use strict';

    try {
        if (typeof THREE === 'undefined') {
            console.error("Three.js library not loaded. Background cannot be initialized.");
            return;
        }

        // --- Variable Declarations ---
        var scene, camera, renderer;
        var container, HEIGHT, WIDTH, fieldOfView, aspectRatio, nearPlane, farPlane;
        var geometry, particleCount, i, materials = [], mouseX = 0, mouseY = 0; // Removed unused h, color, size here
        var windowHalfX, windowHalfY, cameraZ, fogHex, fogDensity, parameters = {}, parameterCount, particles;
        var rafId = null;
        var backgroundState = 'normal'; // Current visual state ('normal', 'rave', 'techno')
        var isPaused = false; // Flag to pause the animation

        // --- Configuration Constants ---
        const BACKGROUND_COLOR = 0x0a0514;
        const FOG_COLOR = 0x0a0514;
        const FOG_DENSITY = 0.001;
        const PARTICLE_COUNT = 15000; // Increased from 10000

        // Parameters for NORMAL state: [ [H, S, L], BaseSize ]
        const PARTICLE_PARAMS_NORMAL = [
            [[0.95, 0.7, 0.35], 4], // Increased base sizes and adjusted colors for more visibility
            [[0.80, 0.7, 0.32], 3.5],
            [[0.0, 0.7, 0.32], 3.5],
            [[0.85, 0.6, 0.30], 3],
            [[0.98, 0.6, 0.30], 3]
        ];
        // Parameters for RAVE state: [ [H, S, L], BaseSize ]
        const PARTICLE_PARAMS_RAVE = [
            [[0.95, 0.9, 0.70], 4.5],
            [[0.80, 0.9, 0.65], 4],
            [[0.0, 0.9, 0.65], 4],
            [[0.85, 0.8, 0.60], 3.5],
            [[0.98, 0.8, 0.60], 3.5]
        ];
        // Parameters for TECHNO state: [ [Sat, Light], BaseSize ]
        const PARTICLE_PARAMS_TECHNO = [
            [[1.0, 0.8], 4.5],
            [[1.0, 0.7], 3.5],
            [[0.9, 0.8], 4.0],
            [[1.0, 0.7], 4.0],
            [[0.8, 0.8], 3.0]
        ];

        const CAMERA_Z = 1000;
        const ROTATION_SPEED_NORMAL = 0.000035; // Increased from 0.000015
        const ROTATION_SPEED_RAVE = 0.00012; // Increased from 0.00008
        const ROTATION_SPEED_TECHNO = 0.00035; // Increased from 0.00025
        const BREATHING_INTENSITY = 40; // Increased from 25
        const BREATHING_SPEED = 0.00015; // Increased from 0.0001

        // Make the function globally available
        window.setBackgroundPaused = function(paused) {
            isPaused = paused;
            console.log("Background animation paused:", isPaused);
            if (!isPaused && !rafId) {
                // Resume animation if it was stopped
                animate();
            }
        };

        /** Initializes the Three.js environment. */
        function initThreeJS() {
            container = document.getElementById('threejs-bg');
            if (!container) { console.error("Three.js container #threejs-bg not found."); return; }

            // Setup dimensions and camera parameters
            HEIGHT = window.innerHeight; WIDTH = window.innerWidth;
            windowHalfX = WIDTH / 2; windowHalfY = HEIGHT / 2;
            fieldOfView = 75; aspectRatio = WIDTH / HEIGHT; nearPlane = 1; farPlane = 3000;
            cameraZ = CAMERA_Z; fogHex = FOG_COLOR; fogDensity = FOG_DENSITY;

            // Create camera and scene
            camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
            camera.position.z = cameraZ;
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(fogHex, fogDensity);

            // Create particle geometry
            geometry = new THREE.BufferGeometry();
            const positions = []; particleCount = PARTICLE_COUNT;
            for (i = 0; i < particleCount; i++) {
                // Create a more dynamic distribution - particles closer to the center
                let radius = Math.random() * 2000;
                let theta = Math.random() * Math.PI * 2;
                let phi = Math.random() * Math.PI;
                
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);
                
                positions.push(x, y, z);
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            // Create materials and points objects based on initial parameters (normal state)
            parameters = PARTICLE_PARAMS_NORMAL;
            parameterCount = parameters.length;
            materials = [];
            for (i = 0; i < parameterCount; i++) {
                // Note: color is set dynamically in render, only need size here for material creation
                const size = parameters[i][1];
                materials[i] = new THREE.PointsMaterial({
                    size: size, vertexColors: false, blending: THREE.AdditiveBlending, // Changed to AdditiveBlending
                    transparent: true, opacity: 0.8 // Increased opacity
                });
                particles = new THREE.Points(geometry, materials[i]);
                particles.rotation.x = Math.random() * 6; particles.rotation.y = Math.random() * 6; particles.rotation.z = Math.random() * 6;
                scene.add(particles);
            }

            // Initialize renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(WIDTH, HEIGHT);
            renderer.setClearColor(BACKGROUND_COLOR, 1);
            container.appendChild(renderer.domElement);

            // --- Event Listeners ---
            window.addEventListener('resize', onWindowResize, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
            document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });

            // Listen for state changes from interactions.js
            document.addEventListener('background-state-change', (e) => {
                const newState = e.detail.state;
                if (['normal', 'rave', 'techno'].includes(newState)) {
                    console.log("Background state change received:", newState);
                    backgroundState = newState;
                } else {
                    console.warn("Received unknown background state:", newState);
                    backgroundState = 'normal'; // Fallback to normal
                }
            });

            animate(); // Start animation loop
            console.log("Three.js background initialized.");
        }

        /** Animation loop ticker. */
        function animate() {
            if (!isPaused) {
                rafId = requestAnimationFrame(animate);
                renderThreeJS();
            } else {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        /** Renders a single frame. */
        function renderThreeJS() {
            // --- Determine current parameters based on state ---
            let currentRotationSpeed;
            let currentParams;
            let rotationMultiplier;
            let followSpeed = 0.02; // Default follow speed

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
                    rotationMultiplier = 30; // Much higher multiplier for erratic spin
                    followSpeed = 0.04; // Slightly faster follow? Optional.
                    break;
                case 'normal':
                default: // Fallback to normal
                    currentRotationSpeed = ROTATION_SPEED_NORMAL;
                    currentParams = PARTICLE_PARAMS_NORMAL;
                    rotationMultiplier = 1;
                    followSpeed = 0.02;
                    break;
            }
            const time = Date.now() * currentRotationSpeed; // Time for rotation

            // --- Animate camera ---
            camera.position.z = cameraZ + Math.sin(Date.now() * BREATHING_SPEED) * BREATHING_INTENSITY;
            camera.position.x += (mouseX - camera.position.x) * followSpeed;
            camera.position.y += (-mouseY - camera.position.y) * followSpeed;
            camera.lookAt(scene.position);

            // --- Animate particle systems rotation ---
            for (i = 0; i < scene.children.length; i++) {
                const object = scene.children[i];
                if (object instanceof THREE.Points) {
                    // Base rotation
                    object.rotation.y = time * rotationMultiplier * (i < (parameterCount / 2) ? i + 1 : -(i + 1));
                    // Add extra random rotation for all states
                    object.rotation.x += (Math.random() - 0.5) * 0.002;
                    object.rotation.z += (Math.random() - 0.5) * 0.002;
                    
                    // Add extra small random rotation for techno 'erratic' feel
                    if (backgroundState === 'techno') {
                        object.rotation.x += (Math.random() - 0.5) * 0.007;
                        object.rotation.z += (Math.random() - 0.5) * 0.007;
                    }
                }
            }

            // --- Animate materials (Color, Opacity, Size) ---
            parameterCount = currentParams.length; // Update count in case arrays differ
            for (i = 0; i < materials.length; i++) {
                const material = materials[i]; // Get the material
                 // Use modulo for safety if materials.length > currentParams.length
                const paramIndex = i % parameterCount;

                if (backgroundState === 'techno') {
                    const technoParams = currentParams[paramIndex][0]; // [Sat, Light]
                    const baseSize = currentParams[paramIndex][1];     // Base Size
                    const technoSat = technoParams[0];
                    const technoLight = technoParams[1];

                    // Rapidly cycle hue across the full spectrum, offset by particle index
                    let h = (Date.now() * 0.002 + i * 0.2) % 1; // Faster color cycling
                    material.color.setHSL(h, technoSat, technoLight);

                    material.opacity = 0.95; // Higher opacity
                    // Base size + more random variation each frame for flickering effect
                    material.size = baseSize + (Math.random() - 0.5) * 1.5; // More variation

                } else { // Logic for 'normal' and 'rave' states
                    const normalRaveParams = currentParams[paramIndex][0]; // [H, S, L]
                    const baseSize = currentParams[paramIndex][1];
                    const baseH = normalRaveParams[0];
                    const baseS = normalRaveParams[1];
                    const baseL = normalRaveParams[2];

                    // More pronounced hue shift for normal/rave
                    const hueSpeed = backgroundState === 'rave' ? 0.001 : 0.0005;
                    let h_norm_rave = baseH + Math.sin(Date.now() * hueSpeed + i * Math.PI) * 0.1;
                    h_norm_rave = (h_norm_rave + 1) % 1; // Wrap hue

                    material.color.setHSL(h_norm_rave, baseS, baseL);
                    material.opacity = backgroundState === 'rave' ? 0.9 : 0.8;
                    // Add slight size variation even for normal/rave
                    material.size = baseSize + (Math.random() - 0.5) * 0.5;
                }
            }

            // Render the scene
            if (renderer) { renderer.render(scene, camera); }
        }

        // --- Event Handlers ---
        function onDocumentMouseMove(e) { /* ... (Keep code from previous complete version) ... */
             mouseX = e.clientX - windowHalfX; mouseY = e.clientY - windowHalfY;
        }
        function onDocumentTouchStart(e) { /* ... (Keep code from previous complete version w/ conditional preventDefault) ... */
            if (e.touches.length === 1) {
                if (e.target === container || e.target === renderer?.domElement) { /* Conditional preventDefault() */ }
                mouseX = e.touches[0].pageX - windowHalfX; mouseY = e.touches[0].pageY - windowHalfY;
            }
        }
        function onDocumentTouchMove(e) { /* ... (Keep code from previous complete version w/ conditional preventDefault) ... */
             if (e.touches.length === 1) {
                 if (e.target === container || e.target === renderer?.domElement) { /* Conditional preventDefault() */ }
                 mouseX = e.touches[0].pageX - windowHalfX; mouseY = e.touches[0].pageY - windowHalfY;
             }
        }
        function onWindowResize() { /* ... (Keep code from previous complete version) ... */
            try {
                WIDTH = window.innerWidth; HEIGHT = window.innerHeight; windowHalfX = WIDTH / 2; windowHalfY = HEIGHT / 2;
                if(camera){ camera.aspect = WIDTH / HEIGHT; camera.updateProjectionMatrix(); }
                if (renderer) renderer.setSize(WIDTH, HEIGHT);
            } catch(e) { console.error("Error on window resize:", e); }
        }

        // --- Initialize ---
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initThreeJS);
        } else {
            initThreeJS();
        }

        // --- Cleanup ---
        window.addEventListener('unload', () => { /* ... (Keep code from previous complete version) ... */
             if (rafId) cancelAnimationFrame(rafId);
             window.removeEventListener('resize', onWindowResize);
             document.removeEventListener('mousemove', onDocumentMouseMove);
             document.removeEventListener('touchstart', onDocumentTouchStart);
             document.removeEventListener('touchmove', onDocumentTouchMove);
             // Need reference to remove custom event listener handler if it wasn't anonymous
             console.log("Three.js background cleaned up.");
        });

    // Catch top-level errors
    } catch (e) {
        console.error("Error in Three.js background script:", e);
        const bgContainer = document.getElementById('threejs-bg');
        if (bgContainer) bgContainer.style.background = '#111';
    }
})(); // End of IIFE