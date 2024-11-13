// Initialize variables
let containers;

// Coefficients 
const COEFFICIENTS = {
    width: 0.1,       // WIDTH_COEFFICIENT
    height: 0.4,      // HEIGHT_COEFFICIENT
    speed: 0.6,       // time multiplier
    complexity: 20,   // iteration count
    turbulence: 0.3,  // swirl factor
    zoom: 2.0,        // UV scale
    colorShift: 0.4,  // color range
    intensity: 0.6,   // color base
    // Pattern constants
    i0Base: 1.4,      // Initial pattern scale
    i1Base: 1.9,      // Time division
    i2Base: 1.4,      // Pattern division
    i4Base: 0.6,      // Base offset
    i0Mult: 1.93,     // Pattern scale growth
    i1Mult: 1.15,     // Time division growth
    i2Mult: 1.7,      // Pattern intensity growth
    i4Add: 0.65,      // Base offset growth
    i4TimeMult: 0.1   // Time multiplication for offset
};


// Get all gradient containers
containers = document.querySelectorAll('.gradient-container');

function initGradient(container, index) {
    // Create container-specific variables with offset based on index
    const gradientState = {
        startTime: Date.now() + (index * 1000), // Add offset to startTime based on container index
        timeOffset: Math.random() * Math.PI * 2, // Random phase offset for each container
        camera: new THREE.Camera(),
        scene: new THREE.Scene(),
        uniforms: {
            iGlobalTime: { type: "f", value: 1.0 },
            iResolution: { type: "v2", value: new THREE.Vector2() },
            iContainerSize: { type: "v2", value: new THREE.Vector2() },
            iSizeCoefficients: { type: "v2", value: new THREE.Vector2(COEFFICIENTS.width, COEFFICIENTS.height) },
            iSpeed: { type: "f", value: COEFFICIENTS.speed * (0.8 + Math.random() * 0.4) }, // Randomized speed
            iTurbulence: { type: "f", value: COEFFICIENTS.turbulence },
            iZoom: { type: "f", value: COEFFICIENTS.zoom },
            iColorShift: { type: "f", value: COEFFICIENTS.colorShift },
            iIntensity: { type: "f", value: COEFFICIENTS.intensity }
        }
    };

    gradientState.camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const material = new THREE.ShaderMaterial({
        uniforms: gradientState.uniforms,
        vertexShader: `
            varying vec2 vUv; 
            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec2 iResolution;
            uniform vec2 iContainerSize;
            uniform vec2 iSizeCoefficients;
            uniform float iGlobalTime;
            uniform float iSpeed;
            uniform float iTurbulence;
            uniform float iZoom;
            uniform float iColorShift;
            uniform float iIntensity;
            varying vec2 vUv; 
            
            void main(void) {
                vec2 adjustedUv = vUv * iSizeCoefficients;
                float aspectRatio = iContainerSize.x / iContainerSize.y;
                
                float time = iGlobalTime * iSpeed + ${Math.random() * 10.0}; // Add random time offset
                vec2 uv = (-1.0 + 2.0 * adjustedUv) * iZoom;
                
                uv.x *= aspectRatio;
                
                vec2 uv0 = uv;
                float i0 = ${COEFFICIENTS.i0Base};
                float i1 = ${COEFFICIENTS.i1Base};
                float i2 = ${COEFFICIENTS.i2Base};
                float i4 = ${COEFFICIENTS.i4Base};
                
                for(int s = 0; s < ${COEFFICIENTS.complexity}; s++) {
                    vec2 r;
                    r = vec2(cos(uv.y * i0 - i4 + time/i1), sin(uv.x * i0 - i4 + time/i1))/i2;
                    r += vec2(-r.y, r.x) * iTurbulence;
                    uv.xy += r - 0.5;
                    i0 *= ${COEFFICIENTS.i0Mult};
                    i1 *= ${COEFFICIENTS.i1Mult};
                    i2 *= ${COEFFICIENTS.i2Mult};
                    i4 += ${COEFFICIENTS.i4Add} + ${COEFFICIENTS.i4TimeMult} * time * i1;
                }
                
                float r = sin(uv.x - time) * iColorShift + iIntensity;
                float b = sin(uv.y + time) * iColorShift + iIntensity;
                float g = 0.0;
                
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `
    });

    const mesh = new THREE.Mesh(geometry, material);
    gradientState.scene.add(mesh);

    gradientState.renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    gradientState.renderer.setPixelRatio(window.devicePixelRatio);
    
    container.innerHTML = '';
    container.appendChild(gradientState.renderer.domElement);

    function updateSize() {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        gradientState.uniforms.iResolution.value.x = width;
        gradientState.uniforms.iResolution.value.y = height;
        gradientState.uniforms.iContainerSize.value.x = width;
        gradientState.uniforms.iContainerSize.value.y = height;
        
        gradientState.renderer.setSize(width, height);
    }

    // animation function with unique timing for each container
    function animate() {
        requestAnimationFrame(animate);
        const currentTime = (Date.now() - gradientState.startTime) * 0.001;
        // Add the container's unique time offset
        gradientState.uniforms.iGlobalTime.value = currentTime + gradientState.timeOffset;
        gradientState.renderer.render(gradientState.scene, gradientState.camera);
    }

    updateSize();
    animate();

    container.gradientCleanup = () => {
        gradientState.renderer.dispose();
        geometry.dispose();
        material.dispose();
    };

    const resizeHandler = () => updateSize();
    window.addEventListener('resize', resizeHandler);
    container.gradientResizeHandler = resizeHandler;
}

// Initialize all containers with their index
containers.forEach((container, index) => {
    initGradient(container, index);
});

function updateCoefficients(newCoefficients) {
    Object.assign(COEFFICIENTS, newCoefficients);
    containers.forEach((container, index) => {
        if (container.gradientCleanup) {
            container.gradientCleanup();
            container.removeEventListener('resize', container.gradientResizeHandler);
            initGradient(container, index);
        }
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCoefficients,
        COEFFICIENTS
    };
}