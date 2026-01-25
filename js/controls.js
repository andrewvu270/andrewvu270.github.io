/**
 * ControlsSetup - Manages camera controls for the 3D scene
 * Implements OrbitControls for interactive camera manipulation
 */
class ControlsSetup {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.controls = null;
  }

  /**
   * Initialize and configure OrbitControls
   * @returns {THREE.OrbitControls} The configured controls instance
   */
  setupControls() {
    // Create OrbitControls instance
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Configure controls
    this.configureControls();
    
    return this.controls;
  }

  /**
   * Configure OrbitControls with damping, limits, and behavior
   */
  configureControls() {
    if (!this.controls) return;
    
    // Enable damping for smooth, natural camera movements
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Set distance limits for zoom
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    
    // Limit camera rotation to prevent disorienting views
    // Max polar angle prevents viewing from below
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // Disable auto-rotate (user-controlled only)
    this.controls.autoRotate = false;
    
    // Enable zoom and pan
    this.controls.enableZoom = true;
    this.controls.enablePan = false; // Disable panning to keep focus on center
  }

  /**
   * Update controls (call this in the render loop)
   * Required when damping is enabled
   */
  update() {
    if (this.controls && this.controls.enableDamping) {
      this.controls.update();
    }
  }

  /**
   * Clean up controls resources
   */
  dispose() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }
}

export { ControlsSetup };

// Make available globally
window.ControlsSetup = ControlsSetup;
