/**
 * AnimationManager - Manages animations for 3D models
 * Handles idle animations, floating effects, and fade-in transitions
 */
class AnimationManager {
  constructor(scene, models) {
    this.scene = scene;
    this.models = models;
    this.clock = new THREE.Clock();
    this.animations = [];
    this.fadeInAnimations = new Map();
  }

  /**
   * Set up all animations for loaded models
   */
  setupAnimations() {
    // Add idle animation to dog model if it exists
    if (this.models.dog) {
      this.addIdleAnimation(this.models.dog);
      this.addFadeInAnimation(this.models.dog);
    }
    
    // Add floating animation to bubble if it exists
    if (this.models.bubble) {
      this.addFloatingAnimation(this.models.bubble);
      this.addFadeInAnimation(this.models.bubble);
    }
    
    // Add fade-in to other models
    Object.entries(this.models).forEach(([name, model]) => {
      if (name !== 'dog' && name !== 'bubble' && model) {
        this.addFadeInAnimation(model);
      }
    });
  }

  /**
   * Add subtle idle bobbing animation to a model
   * @param {THREE.Object3D} model - The model to animate
   */
  addIdleAnimation(model) {
    const animation = {
      type: 'rotate',
      model: model,
      rotationSpeed: 0.3 // Slow rotation speed
    };
    
    this.animations.push(animation);
  }

  /**
   * Add floating animation to a model (vertical oscillation)
   * @param {THREE.Object3D} model - The model to animate
   */
  addFloatingAnimation(model) {
    const animation = {
      type: 'floating',
      model: model,
      originalY: model.position.y,
      amplitude: 0.3,
      frequency: 0.5,
      phase: 0
    };
    
    this.animations.push(animation);
  }

  /**
   * Add fade-in animation to a model
   * @param {THREE.Object3D} model - The model to fade in
   */
  addFadeInAnimation(model) {
    // Set initial opacity to 0
    model.traverse((child) => {
      if (child.isMesh) {
        // Store original material properties
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      }
    });
    
    // Store fade-in animation data
    this.fadeInAnimations.set(model, {
      startTime: this.clock.getElapsedTime(),
      duration: 1.0, // 1 second fade-in
      completed: false
    });
  }

  /**
   * Update all animations - called each frame
   */
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update fade-in animations
    this.updateFadeInAnimations(elapsedTime);
    
    // Update continuous animations (idle, floating)
    this.updateContinuousAnimations(elapsedTime);
  }

  /**
   * Update fade-in animations
   * @param {number} elapsedTime - Total elapsed time in seconds
   */
  updateFadeInAnimations(elapsedTime) {
    this.fadeInAnimations.forEach((animData, model) => {
      if (animData.completed) return;
      
      const timeSinceStart = elapsedTime - animData.startTime;
      const progress = Math.min(timeSinceStart / animData.duration, 1.0);
      
      // Update opacity for all meshes in the model
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = progress;
        }
      });
      
      // Mark as completed when done
      if (progress >= 1.0) {
        animData.completed = true;
        
        // Clean up transparency flag if material is fully opaque
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
      }
    });
  }

  /**
   * Update continuous animations (idle, floating)
   * @param {number} elapsedTime - Total elapsed time in seconds
   */
  updateContinuousAnimations(elapsedTime) {
    this.animations.forEach((animation) => {
      if (!animation.model) return;
      
      if (animation.type === 'rotate') {
        // Slow rotation around Y axis
        animation.model.rotation.y += animation.rotationSpeed * 0.01;
      } else if (animation.type === 'floating') {
        // Calculate sine wave for smooth oscillation
        const offset = Math.sin(elapsedTime * animation.frequency * Math.PI * 2) * animation.amplitude;
        // Apply vertical offset
        animation.model.position.y = animation.originalY + offset;
      }
    });
  }

  /**
   * Add a custom animation
   * @param {Object} animationConfig - Configuration for the animation
   */
  addAnimation(animationConfig) {
    this.animations.push(animationConfig);
  }

  /**
   * Remove an animation for a specific model
   * @param {THREE.Object3D} model - The model to stop animating
   */
  removeAnimation(model) {
    this.animations = this.animations.filter(anim => anim.model !== model);
    this.fadeInAnimations.delete(model);
  }

  /**
   * Pause all animations
   */
  pause() {
    this.clock.stop();
  }

  /**
   * Resume all animations
   */
  resume() {
    this.clock.start();
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.animations = [];
    this.fadeInAnimations.clear();
    this.models = {};
  }
}

export { AnimationManager };

// Make available globally
window.AnimationManager = AnimationManager;
