/**
 * WebGL Performance Management Hook
 * Handles DPR clamping, performance monitoring, and adaptive quality
 */

class WebGLPerformance {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.targetFPS = 60;
    this.quality = 1.0;
    this.isLowPerformance = false;
    this.callbacks = new Set();

    this.init();
  }

  init() {
    // Clamp device pixel ratio for performance
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Detect low-end devices
    this.detectDeviceCapabilities();

    // Start performance monitoring
    this.startMonitoring();
  }

  detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      this.isLowPerformance = true;
      return;
    }

    // Check for common low-end indicators
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);

    const lowEndIndicators = [
      'PowerVR', 'Adreno 3', 'Mali-4', 'Intel HD Graphics 3000',
      'Intel HD Graphics 4000', 'GeForce 8', 'GeForce 9'
    ];

    this.isLowPerformance = lowEndIndicators.some(indicator =>
      renderer.includes(indicator) || vendor.includes(indicator)
    );

    // Check available memory (if supported)
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const unmaskedRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      this.isLowPerformance = this.isLowPerformance ||
        unmaskedRenderer.includes('Software') ||
        unmaskedRenderer.includes('SwiftShader');
    }

    // Adjust initial quality based on device
    if (this.isLowPerformance) {
      this.quality = 0.5;
      this.targetFPS = 30;
    }
  }

  startMonitoring() {
    const monitor = () => {
      const now = performance.now();
      const delta = now - this.lastTime;

      this.frameCount++;

      // Calculate FPS every second
      if (delta >= 1000) {
        this.fps = (this.frameCount * 1000) / delta;
        this.frameCount = 0;
        this.lastTime = now;

        // Adaptive quality adjustment
        this.adjustQuality();

        // Notify listeners
        this.callbacks.forEach(callback => callback({
          fps: this.fps,
          quality: this.quality,
          isLowPerformance: this.isLowPerformance
        }));
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  adjustQuality() {
    const targetFPS = this.targetFPS;

    if (this.fps < targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.quality = Math.max(0.3, this.quality - 0.1);
    } else if (this.fps > targetFPS * 0.95 && this.quality < 1.0) {
      // Performance is good, increase quality
      this.quality = Math.min(1.0, this.quality + 0.05);
    }
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getRecommendedSettings() {
    return {
      pixelRatio: this.dpr,
      enableBloom: !this.isLowPerformance && this.quality > 0.7,
      particleCount: Math.floor(this.quality * 100),
      linkCount: Math.floor(this.quality * 50),
      enableComplexShaders: this.quality > 0.5
    };
  }
}

// Export singleton instance
export const webglPerformance = new WebGLPerformance();

// React-style hook for component integration
export function useWebGLPerformance() {
  const [performance, setPerformance] = useState(webglPerformance.getRecommendedSettings());

  useEffect(() => {
    const unsubscribe = webglPerformance.subscribe((stats) => {
      setPerformance(webglPerformance.getRecommendedSettings());
    });

    return unsubscribe;
  }, []);

  return performance;
}
