/**
 * SceneManager - Manages the Three.js 3D scene in the hero section
 * Handles scene initialization, rendering, and resource cleanup
 */
class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.modelLoader = null;
    this.lightingSetup = null;
    this.controlsSetup = null;
    this.animationManager = null;
    this.responsiveHandler = null;
    this.models = {};
    this.isInitialized = false;
    this.animationFrameId = null;

    // Bind methods to preserve context
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * Check if WebGL is supported by the browser
   * @returns {boolean} True if WebGL is supported
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      return false;
    }
  }

  /**
   * Initialize the 3D scene
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    // Check WebGL support first
    if (!this.checkWebGLSupport()) {
      console.warn('WebGL is not supported in this browser. 3D scene will not be displayed.');
      return false;
    }

    try {
      // Initialize Three.js components
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLighting();
      this.setupControls();

      // Initialize responsive handler
      this.setupResponsiveHandler();

      // Initialize model loader
      this.modelLoader = new ModelLoader(this.scene);

      // Load the dog model (primary model)
      await this.loadModels();

      // Update responsive handler with loaded models
      if (this.responsiveHandler) {
        this.responsiveHandler.updateModels(this.models);
      }

      // Set up animations after models are loaded
      this.setupAnimations();

      // Add resize listener
      window.addEventListener('resize', this.handleResize);

      // Start render loop
      this.animate();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize 3D scene:', error);
      return false;
    }
  }

  /**
   * Create and configure the Three.js scene
   */
  setupScene() {
    this.scene = new THREE.Scene();
  }

  /**
   * Set up scene lighting
   */
  setupLighting() {
    this.lightingSetup = new LightingSetup(this.scene);
    this.lightingSetup.setupLights();
  }

  /**
   * Set up camera controls
   */
  setupControls() {
    this.controlsSetup = new ControlsSetup(this.camera, this.renderer);
    this.controlsSetup.setupControls();
  }

  /**
   * Set up animations for loaded models
   */
  setupAnimations() {
    this.animationManager = new AnimationManager(this.scene, this.models);
    this.animationManager.setupAnimations();
  }

  /**
   * Set up responsive handler for device-specific adjustments
   */
  setupResponsiveHandler() {
    this.responsiveHandler = new ResponsiveHandler(
      this.camera,
      this.renderer,
      this.scene,
      this.models
    );
    this.responsiveHandler.setContainer(this.container);
  }

  /**
   * Load 3D models into the scene
   * @returns {Promise<void>}
   */
  async loadModels() {
    try {
      // Load the dog model (primary model for this task)
      const dogModel = await this.modelLoader.loadDogModel();

      if (dogModel) {
        this.models.dog = dogModel;
        console.log('Dog model loaded and positioned successfully');
      } else {
        console.warn('Failed to load dog model - scene will display without it');
      }
    } catch (error) {
      console.error('Error loading models:', error);
      // Continue without models - graceful degradation
    }
  }

  /**
   * Create and configure the camera
   */
  setupCamera() {
    const fov = 45;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const near = 0.1;
    const far = 1000;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 5, 11);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Create and configure the WebGL renderer
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    // Set pixel ratio for sharp rendering on high-DPI displays
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Set output encoding for proper color representation
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Set size to match container
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // Create canvas and attach to container
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Animation loop - renders the scene at 60fps
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Update controls (required for damping)
    if (this.controlsSetup) {
      this.controlsSetup.update();
    }

    // Update animations
    if (this.animationManager) {
      this.animationManager.update();
    }

    // Render the scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    if (!this.isInitialized) return;

    // Delegate to responsive handler
    if (this.responsiveHandler) {
      this.responsiveHandler.handleResize();
    } else {
      // Fallback if responsive handler not initialized
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
  }

  /**
   * Clean up resources when scene is no longer needed
   */
  dispose() {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Dispose of model loader
    if (this.modelLoader) {
      this.modelLoader.dispose();
      this.modelLoader = null;
    }

    // Dispose of lighting
    if (this.lightingSetup) {
      this.lightingSetup.dispose();
      this.lightingSetup = null;
    }

    // Dispose of controls
    if (this.controlsSetup) {
      this.controlsSetup.dispose();
      this.controlsSetup = null;
    }

    // Dispose of animation manager
    if (this.animationManager) {
      this.animationManager.dispose();
      this.animationManager = null;
    }

    // Dispose of responsive handler
    if (this.responsiveHandler) {
      this.responsiveHandler.dispose();
      this.responsiveHandler = null;
    }

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();

      // Remove canvas from DOM
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Dispose of scene objects
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.models = {};
    this.isInitialized = false;
  }
}


export { SceneManager };

// Make available globally
window.SceneManager = SceneManager;
