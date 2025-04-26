// background.js - Optimized Three.js background animation for Forte Card Previewer
// Creates a performant particle system that adapts to the device capabilities

let camera, scene, renderer;
let particles, particleGeometry;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let animationFrame = null;
let isInitialized = false;
let isRunning = true;
let particleCount = 0;
let performanceMode = 'high'; // high, medium, low

document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the Three.js background
 */
function init() {
    const threejsBg = document.getElementById('threejs-bg');
    if (!threejsBg) {
        console.error('No #threejs-bg element found');
        return;
    }

    // Auto-detect device performance capability based on screen and device pixel ratio
    detectPerformanceMode();
    
    console.log(`Initializing Three.js background in ${performanceMode} performance mode`);

    // Initialize scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 450;

    // Create renderer with settings based on performance mode
    renderer = new THREE.WebGLRenderer({ 
        antialias: performanceMode === 'high', 
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Add to DOM
    threejsBg.appendChild(renderer.domElement);

    // Create particles with count based on performance mode
    createParticles();

    // Add event listeners
    window.addEventListener('resize', onWindowResize, false);
    
    // Don't track mouse movements in low performance mode to save CPU
    if (performanceMode !== 'low') {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
    }
    
    // Start animation loop
    animate();
    
    // Throttle animation in low performance mode when page is not in view
    if (performanceMode === 'low' || performanceMode === 'medium') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    isInitialized = true;
    console.log("Three.js background initialized successfully.");
}

/**
 * Detect device performance capabilities and set appropriate mode
 */
function detectPerformanceMode() {
    // Get device metrics
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const pixelRatio = window.devicePixelRatio || 1;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPowerDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
    
    // Check for mobile with high DPI (likely taxing on GPU)
    if (isMobile && pixelRatio > 2) {
        performanceMode = 'low';
        particleCount = 50; // Very low particle count
    }
    // Check for mobile with normal DPI
    else if (isMobile || isLowPowerDevice) {
        performanceMode = 'medium';
        particleCount = 100; // Low particle count
    }
    // Check for small screens (like tablets)
    else if (screenWidth * screenHeight < 1920 * 1080) {
        performanceMode = 'medium';
        particleCount = 150; // Medium particle count
    }
    // High performance mode for desktops
    else {
        performanceMode = 'high';
        particleCount = 200; // High particle count
    }
    
    // Allow override from URL parameter for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('perfMode')) {
        const requestedMode = urlParams.get('perfMode');
        if (['high', 'medium', 'low'].includes(requestedMode)) {
            performanceMode = requestedMode;
            
            // Adjust particle count based on requested mode
            if (performanceMode === 'high') particleCount = 200;
            else if (performanceMode === 'medium') particleCount = 100;
            else particleCount = 50;
        }
    }
}

/**
 * Create particle system
 */
function createParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Color palette - use theme colors for consistency
    const palette = [
        new THREE.Color(0xe70505), // Red
        new THREE.Color(0xff9500), // Orange
        new THREE.Color(0xffd700), // Gold
        new THREE.Color(0x4a044e), // Purple
        new THREE.Color(0xb026ff)  // Violet
    ];

    // Set particle attributes
    for (let i = 0; i < particleCount; i++) {
        // Position with different spread based on performance mode
        const spread = performanceMode === 'high' ? 1000 : (performanceMode === 'medium' ? 800 : 600);
        positions[i * 3] = (Math.random() - 0.5) * spread;     // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread; // z

        // Random color from palette
        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Random size based on performance mode
        const maxSize = performanceMode === 'high' ? 12 : (performanceMode === 'medium' ? 10 : 8);
        sizes[i] = Math.random() * maxSize + 2;
    }

    // Set buffer attributes
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle material with quality settings based on mode
    const particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: performanceMode === 'low' ? 0.5 : 0.7,
        sizeAttenuation: true,
        depthWrite: false // Improve performance by not writing to depth buffer
    });

    // Create the particle system
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

/**
 * Handle mouse movement
 */
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
}

/**
 * Handle window resize
 */
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handle page visibility changes to save resources when tab is not visible
 */
function handleVisibilityChange() {
    if (document.hidden) {
        pauseAnimation();
    } else {
        resumeAnimation();
    }
}

/**
 * Animation loop
 */
function animate() {
    animationFrame = requestAnimationFrame(animate);
    render();
}

/**
 * Pause animation when page not visible
 */
function pauseAnimation() {
    if (!isRunning) return;
    
    cancelAnimationFrame(animationFrame);
    isRunning = false;
    console.log("Background animation paused");
}

/**
 * Resume animation when page becomes visible
 */
function resumeAnimation() {
    if (isRunning) return;
    
    animate();
    isRunning = true;
    console.log("Background animation resumed");
}

/**
 * Render scene
 */
function render() {
    // Different animation speeds and complexity based on performance mode
    const rotationSpeed = performanceMode === 'high' ? 0.0007 : 
                          (performanceMode === 'medium' ? 0.0005 : 0.0003);
    
    const particleAnimationSpeed = performanceMode === 'high' ? 0.001 : 
                                  (performanceMode === 'medium' ? 0.0007 : 0.0005);
    
    // Rotate the entire particle system
    particles.rotation.x += 0.0005;
    particles.rotation.y += rotationSpeed;
    
    // Make camera follow mouse movement (disabled in low performance mode)
    if (performanceMode !== 'low') {
        camera.position.x += (mouseX - camera.position.x) * 0.01;
        camera.position.y += (-mouseY - camera.position.y) * 0.01;
        camera.lookAt(scene.position);
    }
    
    // Only update particle positions on high/medium performance modes
    if (performanceMode !== 'low') {
        // Update particle positions for twinkling effect
        const positions = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += Math.sin(Date.now() * particleAnimationSpeed + i) * 0.1;
        }
        particleGeometry.attributes.position.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

// Export functions for potential use by other modules
window.forteBackground = {
    pause: pauseAnimation,
    resume: resumeAnimation,
    setPerformanceMode: (mode) => {
        if (['high', 'medium', 'low'].includes(mode) && mode !== performanceMode) {
            performanceMode = mode;
            // Rebuild particles if already initialized
            if (isInitialized) {
                scene.remove(particles);
                createParticles();
            }
        }
    }
};