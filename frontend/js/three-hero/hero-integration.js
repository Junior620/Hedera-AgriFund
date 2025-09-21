/**
 * Hero Canvas Integration
 * Integrates Three.js hero canvas with existing HTML structure
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class HeroCanvasManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.particles = null;
    this.connections = null;
    this.isInitialized = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();
    this.animationId = null;
  }

  async init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Check WebGL support
      if (!this.checkWebGLSupport()) {
        console.warn('WebGL not supported, using fallback');
        this.showStaticFallback();
        return;
      }

      // Get canvas container
      const container = document.getElementById('hero-canvas');
      if (!container) {
        console.warn('Hero canvas container not found');
        return;
      }

      // Initialize Three.js scene
      this.initScene(container);
      this.initParticleSystem();
      this.initPostProcessing();
      this.setupEventListeners();
      this.startAnimation();

      this.isInitialized = true;
      console.log('Hero canvas initialized successfully');

    } catch (error) {
      console.error('Failed to initialize hero canvas:', error);
      this.showStaticFallback();
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
               (canvas.getContext('webgl') || canvas.getContext('experimental-web-gl')));
    } catch (e) {
      return false;
    }
  }

  initScene(container) {
    // Scene avec background transparent
    this.scene = new THREE.Scene();
    this.scene.background = null; // FORCE transparent background

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer avec transparence complète
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // FORCE alpha channel
      powerPreference: 'high-performance',
      premultipliedAlpha: false // Éviter problèmes de blending
    });

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // FORCE transparent clear

    // S'assurer que le DOM element est transparent
    this.renderer.domElement.style.background = 'transparent';
    this.renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(this.renderer.domElement);
  }

  initParticleSystem() {
    const particleCount = this.reducedMotion ? 50 : 200;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = this.currentTheme === 'dark'
      ? [new THREE.Color(0x3b82f6), new THREE.Color(0x10b981), new THREE.Color(0x8b5cf6)]
      : [new THREE.Color(0x1e40af), new THREE.Color(0x059669), new THREE.Color(0x7c3aed)];

    for (let i = 0; i < particleCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Colors
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Sizes
      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Create connections between nearby particles
    this.initConnections(positions, particleCount);
  }

  initConnections(positions, particleCount) {
    const connectionGeometry = new THREE.BufferGeometry();
    const connectionPositions = [];
    const connectionColors = [];

    const maxDistance = 3;
    const connectionColor = new THREE.Color(this.currentTheme === 'dark' ? 0x374151 : 0x9ca3af);

    for (let i = 0; i < particleCount; i++) {
      const pos1 = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );

      for (let j = i + 1; j < particleCount; j++) {
        const pos2 = new THREE.Vector3(
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2]
        );

        if (pos1.distanceTo(pos2) < maxDistance) {
          connectionPositions.push(pos1.x, pos1.y, pos1.z);
          connectionPositions.push(pos2.x, pos2.y, pos2.z);

          connectionColors.push(connectionColor.r, connectionColor.g, connectionColor.b);
          connectionColors.push(connectionColor.r, connectionColor.g, connectionColor.b);
        }
      }
    }

    connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
    connectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(connectionColors, 3));

    const connectionMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3
    });

    this.connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    this.scene.add(this.connections);
  }

  initPostProcessing() {
    if (this.reducedMotion) return;

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(bloomPass);
  }

  setupEventListeners() {
    // Mouse movement
    window.addEventListener('mousemove', (event) => {
      this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Theme change
    const observer = new MutationObserver(() => {
      const newTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      if (newTheme !== this.currentTheme) {
        this.currentTheme = newTheme;
        this.updateTheme();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  updateTheme() {
    // Maintenir la transparence même lors du changement de thème
    if (this.scene) {
      this.scene.background = null; // FORCE transparent pour tous les thèmes
    }

    // Mettre à jour les couleurs des particules selon le thème
    if (this.particles && this.particles.material) {
      const colorPalette = this.currentTheme === 'dark'
        ? [new THREE.Color(0x3b82f6), new THREE.Color(0x10b981), new THREE.Color(0x8b5cf6)]
        : [new THREE.Color(0x1e40af), new THREE.Color(0x059669), new THREE.Color(0x7c3aed)];

      // Appliquer les nouvelles couleurs aux particules existantes
      const colors = this.particles.geometry.attributes.color.array;
      const particleCount = colors.length / 3;

      for (let i = 0; i < particleCount; i++) {
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      this.particles.geometry.attributes.color.needsUpdate = true;
    }
  }

  onWindowResize() {
    const container = document.getElementById('hero-canvas');
    if (!container || !this.camera || !this.renderer) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    if (this.composer) {
      this.composer.setSize(container.clientWidth, container.clientHeight);
    }
  }

  startAnimation() {
    if (this.reducedMotion) {
      // Single render for reduced motion
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      return;
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.updateAnimation();
      this.render();
    };
    animate();
  }

  updateAnimation() {
    const time = Date.now() * 0.001;

    // Smooth mouse following
    this.mouse.lerp(this.targetMouse, 0.05);

    // Rotate particles based on time and mouse
    if (this.particles) {
      this.particles.rotation.x = time * 0.1 + this.mouse.y * 0.1;
      this.particles.rotation.y = time * 0.15 + this.mouse.x * 0.1;
    }

    if (this.connections) {
      this.connections.rotation.x = time * 0.05 + this.mouse.y * 0.05;
      this.connections.rotation.y = time * 0.08 + this.mouse.x * 0.05;
    }
  }

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  showStaticFallback() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    container.innerHTML = `
      <div class="hero-fallback">
        <div class="fallback-pattern"></div>
        <div class="fallback-overlay"></div>
      </div>
    `;
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }

    if (this.connections) {
      this.connections.geometry.dispose();
      this.connections.material.dispose();
    }

    this.isInitialized = false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const heroManager = new HeroCanvasManager();
  heroManager.init();

  // Make available globally for debugging
  window.heroManager = heroManager;
});
