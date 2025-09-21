/**
 * Main Hero Canvas Component
 * Manages Three.js scene with animated background, particle network, and link system
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { webglPerformance } from './webgl-performance.js';

class HeroCanvas {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      theme: 'light',
      reducedMotion: false,
      intensity: 0.8,
      ...options
    };

    // Scene components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;

    // Materials and geometries
    this.backgroundMaterial = null;
    this.particleMaterial = null;
    this.linkMaterial = null;

    // Animation state
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.scroll = 0;
    this.isVisible = true;
    this.isDestroyed = false;

    // Performance monitoring
    this.performanceSettings = webglPerformance.getRecommendedSettings();

    this.init();
  }

  async init() {
    try {
      await this.setupScene();
      await this.loadShaders();
      await this.createBackground();
      await this.createParticles();
      await this.createLinks();
      await this.setupPostProcessing();
      this.setupEventListeners();
      this.animate();
    } catch (error) {
      console.error('Hero Canvas initialization failed:', error);
      this.showFallback();
    }
  }

  async setupScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // FORCE background transparent

    // Camera
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    this.camera.position.z = 1;

    // Renderer avec transparence forcée
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: this.performanceSettings.enableComplexShaders,
      alpha: true, // FORCE alpha channel
      powerPreference: 'high-performance',
      premultipliedAlpha: false // Éviter les problèmes de blending
    });

    this.renderer.setPixelRatio(this.performanceSettings.pixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000, 0); // FORCE transparent clear color

    // S'assurer que le background reste null
    this.scene.background = null;

    // Handle context loss
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLoss.bind(this));
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestore.bind(this));
  }

  async loadShaders() {
    const shaderPaths = {
      backgroundVert: './js/three-hero/shaders/background.vert',
      backgroundFrag: './js/three-hero/shaders/background.frag',
      particlesVert: './js/three-hero/shaders/particles.vert',
      particlesFrag: './js/three-hero/shaders/particles.frag',
      linksVert: './js/three-hero/shaders/links.vert',
      linksFrag: './js/three-hero/shaders/links.frag',
      noise: './js/three-hero/shaders/noise.glsl'
    };

    const loadShader = async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load shader: ${path}`);
      return response.text();
    };

    try {
      this.shaders = {};
      for (const [key, path] of Object.entries(shaderPaths)) {
        this.shaders[key] = await loadShader(path);
      }

      // Inject noise functions into fragment shaders
      this.shaders.backgroundFrag = this.shaders.noise + '\n' + this.shaders.backgroundFrag;
      this.shaders.particlesFrag = this.shaders.noise + '\n' + this.shaders.particlesFrag;
    } catch (error) {
      console.error('Shader loading failed:', error);
      throw error;
    }
  }

  createBackground() {
    const geometry = new THREE.PlaneGeometry(10, 10);

    this.backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPrimaryColor: { value: this.getThemeColors().primary },
        uSecondaryColor: { value: this.getThemeColors().secondary },
        uIntensity: { value: this.options.intensity },
        uResolution: { value: new THREE.Vector2() },
        uReducedMotion: { value: this.options.reducedMotion }
      },
      vertexShader: this.shaders.backgroundVert,
      fragmentShader: this.shaders.backgroundFrag,
      transparent: true
    });

    const backgroundMesh = new THREE.Mesh(geometry, this.backgroundMaterial);
    backgroundMesh.position.z = -1;
    this.scene.add(backgroundMesh);
  }

  createParticles() {
    const particleCount = this.performanceSettings.particleCount;

    // Create base geometry for instancing
    const baseGeometry = new THREE.CircleGeometry(0.05, 8);

    // Instance attributes
    const instancePositions = new Float32Array(particleCount * 3);
    const instanceActivities = new Float32Array(particleCount);
    const instancePhases = new Float32Array(particleCount);

    // Generate "H" pattern for Hedera branding
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      let pos;

      if (i < particleCount * 0.6) {
        // Create loose "H" shape
        pos = this.generateHPatternPosition(t);
      } else {
        // Random scattered particles
        pos = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          0
        );
      }

      instancePositions[i * 3] = pos.x;
      instancePositions[i * 3 + 1] = pos.y;
      instancePositions[i * 3 + 2] = pos.z;

      instanceActivities[i] = Math.random();
      instancePhases[i] = Math.random() * Math.PI * 2;

      this.particles.push({ position: pos, activity: instanceActivities[i] });
    }

    // Set instance attributes
    baseGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
    baseGeometry.setAttribute('instanceActivity', new THREE.InstancedBufferAttribute(instanceActivities, 1));
    baseGeometry.setAttribute('instancePhase', new THREE.InstancedBufferAttribute(instancePhases, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: this.mouse },
        uScale: { value: 1.0 },
        uParticleColor: { value: this.getThemeColors().accent },
        uIntensity: { value: this.options.intensity },
        uReducedMotion: { value: this.options.reducedMotion }
      },
      vertexShader: this.shaders.particlesVert,
      fragmentShader: this.shaders.particlesFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.InstancedMesh(baseGeometry, this.particleMaterial, particleCount);
    this.scene.add(this.particleSystem);
  }

  generateHPatternPosition(t) {
    // Create a loose "H" shape with some randomness
    const variation = 0.5;

    if (t < 0.33) {
      // Left vertical line
      return new THREE.Vector3(
        -2 + (Math.random() - 0.5) * variation,
        (t * 3 - 0.5) * 4 + (Math.random() - 0.5) * variation,
        0
      );
    } else if (t < 0.66) {
      // Horizontal line
      const localT = (t - 0.33) * 3;
      return new THREE.Vector3(
        (localT - 0.5) * 4 + (Math.random() - 0.5) * variation,
        (Math.random() - 0.5) * variation,
        0
      );
    } else {
      // Right vertical line
      const localT = (t - 0.66) * 3;
      return new THREE.Vector3(
        2 + (Math.random() - 0.5) * variation,
        (localT - 0.5) * 4 + (Math.random() - 0.5) * variation,
        0
      );
    }
  }

  createLinks() {
    const linkCount = this.performanceSettings.linkCount;
    this.links = [];

    // Create connections between nearby particles
    for (let i = 0; i < linkCount && i < this.particles.length - 1; i++) {
      const start = this.particles[i].position;
      let closestIndex = -1;
      let closestDistance = Infinity;

      // Find closest particle for connection
      for (let j = i + 1; j < this.particles.length; j++) {
        const distance = start.distanceTo(this.particles[j].position);
        if (distance < closestDistance && distance < 3.0) {
          closestDistance = distance;
          closestIndex = j;
        }
      }

      if (closestIndex !== -1) {
        this.links.push({
          start: start,
          end: this.particles[closestIndex].position,
          pulse: Math.random()
        });
      }
    }

    if (this.links.length > 0) {
      this.createLinkMeshes();
    }
  }

  createLinkMeshes() {
    // Create instanced geometry for links
    const geometry = new THREE.PlaneGeometry(1, 0.02, 1, 1);

    const instanceStarts = new Float32Array(this.links.length * 3);
    const instanceEnds = new Float32Array(this.links.length * 3);
    const instancePulses = new Float32Array(this.links.length);

    this.links.forEach((link, i) => {
      instanceStarts[i * 3] = link.start.x;
      instanceStarts[i * 3 + 1] = link.start.y;
      instanceStarts[i * 3 + 2] = link.start.z;

      instanceEnds[i * 3] = link.end.x;
      instanceEnds[i * 3 + 1] = link.end.y;
      instanceEnds[i * 3 + 2] = link.end.z;

      instancePulses[i] = link.pulse;
    });

    geometry.setAttribute('instanceStart', new THREE.InstancedBufferAttribute(instanceStarts, 3));
    geometry.setAttribute('instanceEnd', new THREE.InstancedBufferAttribute(instanceEnds, 3));
    geometry.setAttribute('instancePulse', new THREE.InstancedBufferAttribute(instancePulses, 1));

    this.linkMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLinkColor: { value: this.getThemeColors().link },
        uIntensity: { value: this.options.intensity * 0.6 },
        uReducedMotion: { value: this.options.reducedMotion }
      },
      vertexShader: this.shaders.linksVert,
      fragmentShader: this.shaders.linksFrag,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.linkSystem = new THREE.InstancedMesh(geometry, this.linkMaterial, this.links.length);
    this.scene.add(this.linkSystem);
  }

  setupPostProcessing() {
    if (!this.performanceSettings.enableBloom) return;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      0.3, // strength
      0.5, // radius
      0.8  // threshold
    );

    this.composer.addPass(bloomPass);
  }

  getThemeColors() {
    const colors = {
      light: {
        primary: new THREE.Color(0x1E40AF), // Deep blue
        secondary: new THREE.Color(0x3B82F6), // Lighter blue
        accent: new THREE.Color(0x10B981), // Green
        link: new THREE.Color(0x6366F1) // Purple
      },
      dark: {
        primary: new THREE.Color(0x0F172A), // Dark blue
        secondary: new THREE.Color(0x1E293B), // Darker blue
        accent: new THREE.Color(0x059669), // Darker green
        link: new THREE.Color(0x8B5CF6) // Lighter purple
      }
    };

    return colors[this.options.theme] || colors.light;
  }

  setupEventListeners() {
    // Mouse movement
    const handleMouseMove = (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Scroll tracking
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scroll = Math.min(window.scrollY / scrollHeight, 1);
    };

    // Visibility change
    const handleVisibilityChange = () => {
      this.isVisible = !document.hidden;
    };

    // Resize
    const handleResize = () => {
      this.resize();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    // Store references for cleanup
    this.eventListeners = {
      mousemove: handleMouseMove,
      scroll: handleScroll,
      visibilitychange: handleVisibilityChange,
      resize: handleResize
    };

    // Performance monitoring
    this.performanceUnsubscribe = webglPerformance.subscribe((stats) => {
      this.performanceSettings = webglPerformance.getRecommendedSettings();
      this.updatePerformanceSettings();
    });
  }

  updatePerformanceSettings() {
    if (this.renderer) {
      this.renderer.setPixelRatio(this.performanceSettings.pixelRatio);
    }

    // Update material quality based on performance
    if (this.backgroundMaterial) {
      this.backgroundMaterial.uniforms.uIntensity.value =
        this.options.intensity * (this.performanceSettings.enableComplexShaders ? 1.0 : 0.7);
    }
  }

  animate() {
    if (this.isDestroyed) return;

    requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    const elapsedTime = this.clock.getElapsedTime();

    // Update uniforms
    if (this.backgroundMaterial) {
      this.backgroundMaterial.uniforms.uTime.value = elapsedTime;
    }

    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = elapsedTime;
      this.particleMaterial.uniforms.uMouse.value.copy(this.mouse);
    }

    if (this.linkMaterial) {
      this.linkMaterial.uniforms.uTime.value = elapsedTime;
    }

    // Render
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.left = -width / height * 5;
    this.camera.right = width / height * 5;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    if (this.composer) {
      this.composer.setSize(width, height);
    }

    if (this.backgroundMaterial) {
      this.backgroundMaterial.uniforms.uResolution.value.set(width, height);
    }
  }

  // Public API
  setTheme(theme) {
    this.options.theme = theme;
    const colors = this.getThemeColors();

    if (this.backgroundMaterial) {
      this.backgroundMaterial.uniforms.uPrimaryColor.value.copy(colors.primary);
      this.backgroundMaterial.uniforms.uSecondaryColor.value.copy(colors.secondary);
    }

    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uParticleColor.value.copy(colors.accent);
    }

    if (this.linkMaterial) {
      this.linkMaterial.uniforms.uLinkColor.value.copy(colors.link);
    }
  }

  setIntensity(intensity) {
    this.options.intensity = intensity;

    if (this.backgroundMaterial) {
      this.backgroundMaterial.uniforms.uIntensity.value = intensity;
    }

    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uIntensity.value = intensity;
    }

    if (this.linkMaterial) {
      this.linkMaterial.uniforms.uIntensity.value = intensity * 0.6;
    }
  }

  triggerPulse(fromNodeId, toNodeId) {
    // Trigger pulse animation between specific nodes
    if (this.linkMaterial && this.links[fromNodeId]) {
      this.links[fromNodeId].pulse = 0;
    }
  }

  handleContextLoss(event) {
    event.preventDefault();
    console.warn('WebGL context lost');
    this.showFallback();
  }

  handleContextRestore() {
    console.info('WebGL context restored');
    this.init();
  }

  showFallback() {
    // Show static fallback image
    const fallbackImg = document.createElement('div');
    fallbackImg.className = 'hero-fallback';
    fallbackImg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      opacity: 0.3;
      z-index: -1;
    `;

    this.container.parentNode.insertBefore(fallbackImg, this.container);
    this.container.style.display = 'none';
  }

  destroy() {
    this.isDestroyed = true;

    // Remove event listeners
    if (this.eventListeners) {
      Object.entries(this.eventListeners).forEach(([event, handler]) => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, handler);
        } else {
          window.removeEventListener(event, handler);
        }
      });
    }

    if (this.performanceUnsubscribe) {
      this.performanceUnsubscribe();
    }

    // Dispose Three.js resources
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.composer) {
      this.composer.dispose();
    }
  }
}

export { HeroCanvas };
