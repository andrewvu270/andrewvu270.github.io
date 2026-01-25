/**
 * ModelLoader - Handles loading and positioning of 3D models
 * Uses GLTFLoader to load models asynchronously with error handling
 */

// Scene configuration for model positioning
// Note: dog.glb contains all workspace elements (dog, laptop, plant, cup, bubble)
const SceneConfig = {
  models: {
    dog: {
      url: 'models/dog.glb',
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 }
    }
  }
};

class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = null;
    this.loadingManager = null;
    this.loadedModels = {};
  }

  /**
   * Initialize the GLTF loader with loading manager
   */
  initLoader() {
    // Create loading manager for tracking load progress
    this.loadingManager = new THREE.LoadingManager();
    
    this.loadingManager.onStart = (url) => {
      console.log(`Started loading: ${url}`);
    };
    
    this.loadingManager.onLoad = () => {
      console.log('All models loaded successfully');
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };
    
    // Initialize GLTFLoader with the loading manager
    this.loader = new window.GLTFLoader(this.loadingManager);
    
    // Set up DRACO loader for compressed models
    if (window.DRACOLoader) {
      const dracoLoader = new window.DRACOLoader();
      dracoLoader.setDecoderConfig({ type: 'js' });
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      this.loader.setDRACOLoader(dracoLoader);
    }
  }

  /**
   * Load a single GLTF model
   * @param {string} url - Path to the GLTF/GLB file
   * @param {Object} config - Configuration object with position, scale, rotation
   * @returns {Promise<THREE.Object3D>} The loaded model
   */
  async loadModel(url, config) {
    if (!this.loader) {
      this.initLoader();
    }

    try {
      // Load the model using promise-based API
      const gltf = await new Promise((resolve, reject) => {
        this.loader.load(
          url,
          (gltf) => resolve(gltf),
          (progress) => {
            // Optional: track loading progress
            if (progress.lengthComputable) {
              const percentComplete = (progress.loaded / progress.total) * 100;
              console.log(`Loading ${url}: ${percentComplete.toFixed(2)}%`);
            }
          },
          (error) => reject(error)
        );
      });

      const model = gltf.scene;
      
      // Apply configuration if provided
      if (config) {
        this.applyModelConfig(model, config);
      }
      
      // Add model to scene
      this.scene.add(model);
      
      console.log(`Successfully loaded model: ${url}`);
      return model;
      
    } catch (error) {
      console.error(`Failed to load model from ${url}:`, error);
      return null;
    }
  }

  /**
   * Apply position, scale, and rotation configuration to a model
   * @param {THREE.Object3D} model - The 3D model object
   * @param {Object} config - Configuration with position, scale, rotation
   */
  applyModelConfig(model, config) {
    if (config.position) {
      model.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
    }
    
    if (config.scale) {
      model.scale.set(
        config.scale.x,
        config.scale.y,
        config.scale.z
      );
    }
    
    if (config.rotation) {
      model.rotation.set(
        config.rotation.x,
        config.rotation.y,
        config.rotation.z
      );
    }
  }

  /**
   * Load all models defined in SceneConfig
   * @returns {Promise<Object>} Map of model names to loaded objects
   */
  async loadAllModels() {
    const modelPromises = [];
    const modelNames = [];
    
    // Create promises for all models
    for (const [name, config] of Object.entries(SceneConfig.models)) {
      modelNames.push(name);
      modelPromises.push(this.loadModel(config.url, config));
    }
    
    try {
      // Load all models in parallel
      const models = await Promise.all(modelPromises);
      
      // Create map of model names to objects
      const loadedModels = {};
      modelNames.forEach((name, index) => {
        if (models[index]) {
          loadedModels[name] = models[index];
        }
      });
      
      this.loadedModels = loadedModels;
      return loadedModels;
      
    } catch (error) {
      console.error('Error loading models:', error);
      return this.loadedModels;
    }
  }

  /**
   * Load only the dog model (primary model)
   * @returns {Promise<THREE.Object3D>} The loaded dog model
   */
  async loadDogModel() {
    const dogConfig = SceneConfig.models.dog;
    const dogModel = await this.loadModel(dogConfig.url, dogConfig);
    
    if (dogModel) {
      this.loadedModels.dog = dogModel;
    }
    
    return dogModel;
  }

  /**
   * Get a loaded model by name
   * @param {string} name - Name of the model
   * @returns {THREE.Object3D|null} The model object or null if not found
   */
  getModel(name) {
    return this.loadedModels[name] || null;
  }

  /**
   * Remove a model from the scene
   * @param {string} name - Name of the model to remove
   */
  removeModel(name) {
    const model = this.loadedModels[name];
    if (model) {
      this.scene.remove(model);
      delete this.loadedModels[name];
    }
  }

  /**
   * Dispose of all loaded models and clean up resources
   */
  dispose() {
    Object.values(this.loadedModels).forEach(model => {
      if (model) {
        // Traverse and dispose of geometries and materials
        model.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        
        // Remove from scene
        this.scene.remove(model);
      }
    });
    
    this.loadedModels = {};
  }
}

export { ModelLoader };

// Make available globally
window.ModelLoader = ModelLoader;
