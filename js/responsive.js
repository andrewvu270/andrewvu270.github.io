/**
 * ResponsiveHandler - Manages responsive behavior for the 3D scene
 * Handles window resize events and device-specific adjustments
 */

class ResponsiveHandler {
  constructor(camera, renderer, scene, models = {}) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.models = models;
    this.isMobile = false;
    this.container = null;
    
    // Store original camera and model configurations
    this.originalCameraPosition = { ...camera.position };
    this.originalModelScales = {};
    
    // Bind methods to preserve context
    this.handleResize = this.handleResize.bind(this);
    
    // Initial device check
    this.checkDevice();
  }

  /**
   * Set the container element for size calculations
   * @param {HTMLElement} container - The container element
   */
  setContainer(container) {
    this.container = container;
  }

  /**
   * Detect if the device is mobile based on viewport width
   * @returns {boolean} True if mobile device
   */
  checkDevice() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // If device type changed, apply appropriate adjustments
    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        this.adjustForMobile();
      } else {
        this.adjustForDesktop();
      }
    }
    
    return this.isMobile;
  }

  /**
   * Handle window resize events
   * Updates camera aspect ratio and renderer size
   */
  handleResize() {
    if (!this.camera || !this.renderer) return;
    
    try {
      // Get container dimensions with fallback
      const width = this.container ? this.container.clientWidth : window.innerWidth;
      const height = this.container ? this.container.clientHeight : window.innerHeight;
      
      // Clamp to reasonable minimums
      const clampedWidth = Math.max(width, 300);
      const clampedHeight = Math.max(height, 200);
      
      // Update camera aspect ratio
      this.camera.aspect = clampedWidth / clampedHeight;
      this.camera.updateProjectionMatrix();
      
      // Update renderer size
      this.renderer.setSize(clampedWidth, clampedHeight);
      
      // Check if device type changed
      this.checkDevice();
      
    } catch (error) {
      console.warn('Error handling resize:', error);
    }
  }

  /**
   * Adjust camera and models for mobile viewing
   * Moves camera back and reduces model scales if needed
   */
  adjustForMobile() {
    if (!this.camera) return;
    
    // Store original camera position if not already stored
    if (!this.originalCameraPosition.stored) {
      this.originalCameraPosition = {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
        stored: true
      };
    }
    
    // Move camera back 1.5x distance for better mobile view
    this.camera.position.z = this.originalCameraPosition.z * 1.5;
    
    // Adjust model scales if needed (reduce by 0.8x)
    Object.entries(this.models).forEach(([name, model]) => {
      if (model) {
        // Store original scale if not already stored
        if (!this.originalModelScales[name]) {
          this.originalModelScales[name] = {
            x: model.scale.x,
            y: model.scale.y,
            z: model.scale.z
          };
        }
        
        // Apply mobile scale reduction
        const originalScale = this.originalModelScales[name];
        model.scale.set(
          originalScale.x * 0.8,
          originalScale.y * 0.8,
          originalScale.z * 0.8
        );
      }
    });
    
    console.log('Applied mobile adjustments');
  }

  /**
   * Adjust camera and models for desktop viewing
   * Restores original camera position and model scales
   */
  adjustForDesktop() {
    if (!this.camera) return;
    
    // Restore original camera position
    if (this.originalCameraPosition.stored) {
      this.camera.position.z = this.originalCameraPosition.z;
    }
    
    // Restore original model scales
    Object.entries(this.models).forEach(([name, model]) => {
      if (model && this.originalModelScales[name]) {
        const originalScale = this.originalModelScales[name];
        model.scale.set(
          originalScale.x,
          originalScale.y,
          originalScale.z
        );
      }
    });
    
    console.log('Applied desktop adjustments');
  }

  /**
   * Update models reference (called when new models are loaded)
   * @param {Object} models - Map of model names to objects
   */
  updateModels(models) {
    this.models = models;
    
    // Apply current device adjustments to new models
    if (this.isMobile) {
      this.adjustForMobile();
    }
  }

  /**
   * Clean up resources and remove event listeners
   */
  dispose() {
    // Clear references
    this.camera = null;
    this.renderer = null;
    this.scene = null;
    this.models = {};
    this.originalModelScales = {};
  }
}

export { ResponsiveHandler };

// Make available globally
window.ResponsiveHandler = ResponsiveHandler;
