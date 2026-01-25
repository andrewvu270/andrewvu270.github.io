/**
 * LightingSetup - Configures scene lighting for optimal model visibility
 * Uses simple ambient lighting approach inspired by craftz.dog
 */
class LightingSetup {
  constructor(scene) {
    this.scene = scene;
    this.ambientLight = null;
  }

  /**
   * Set up all lights in the scene
   */
  setupLights() {
    this.createAmbientLight();
  }

  /**
   * Create ambient light for even illumination
   * Uses the proven approach from craftz.dog for natural-looking lighting
   */
  createAmbientLight() {
    // Simple ambient light with moderate intensity for even illumination
    // Color: 0xcccccc (light gray) for natural appearance
    // Intensity: 1.0 for subtle, balanced lighting
    this.ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
    this.scene.add(this.ambientLight);
  }

  /**
   * Clean up lighting resources
   */
  dispose() {
    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
      this.ambientLight = null;
    }
  }
}

export { LightingSetup };

// Make available globally
window.LightingSetup = LightingSetup;
