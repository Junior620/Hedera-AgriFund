# Three.js Hero Canvas - Hedera AgriFund

A production-ready Three.js hero section with GLSL shaders, featuring an animated "Hedera network field" with particles, links, and flowing gradients.

## 🚀 Features

- **Interactive 3D Network**: Particle system forming a loose "H" shape with connecting links
- **GLSL Shaders**: Custom vertex/fragment shaders for background gradients, particles, and links
- **Performance Optimized**: Adaptive quality, DPR clamping, frustum culling, and memory management
- **Accessibility First**: Reduced motion support, screen reader friendly, keyboard navigation
- **Theme Aware**: Automatic light/dark theme switching with Hedera brand colors
- **Mobile Ready**: Responsive design with fallback for low-end devices

## 🏗️ Architecture

```
js/three-hero/
├── hero-integration.js    # Main integration script
├── hero-canvas.js        # Core Three.js implementation  
├── webgl-performance.js  # Performance monitoring
├── hero-tests.js        # Test suite
├── shaders/
│   ├── noise.glsl       # Noise utility functions
│   ├── background.vert  # Background vertex shader
│   ├── background.frag  # Background fragment shader
│   ├── particles.vert   # Particle vertex shader
│   ├── particles.frag   # Particle fragment shader
│   ├── links.vert       # Link vertex shader
│   └── links.frag       # Link fragment shader
└── README.md
```

## 🎨 Visual Concept

The hero canvas creates a "Hedera network field" with:

- **Animated Background**: Flowing gradients using fractal brownian motion (FBM)
- **Particle Network**: 100+ particles forming a breathing "H" pattern
- **Link System**: Dynamic connections with pulse animations
- **Mouse Interaction**: Particles gently repel from cursor
- **Scroll Effects**: Network density changes based on scroll position

## 🛠️ Technical Implementation

### Shaders (GLSL)
- **Background**: Layered noise with time-based flow animation
- **Particles**: Instanced rendering with soft circular alpha and glow effects
- **Links**: Dashed flow patterns with traveling pulse effects
- **Performance**: All shaders respect `prefers-reduced-motion`

### Performance Features
- Device pixel ratio clamped to max 1.5x
- Adaptive quality based on FPS monitoring
- Automatic bloom disable on low-end devices  
- Tab visibility detection to pause rendering
- WebGL context loss recovery

### Accessibility
- Full `prefers-reduced-motion` support with static fallback
- Screen reader compatible (canvas marked `aria-hidden`)
- Skip to content link for keyboard users
- Pause animation button (hidden but accessible)
- High contrast mode support

## 📱 Browser Support

- **Modern Browsers**: Full WebGL + post-processing
- **Mobile**: Reduced quality, no bloom
- **Legacy/Low-end**: Static CSS gradient fallback
- **No WebGL**: Graceful degradation to static background

## 🎮 API Usage

```javascript
// Access the hero canvas instance
const hero = window.HeroCanvas;

// Change theme
hero.setTheme('dark'); // or 'light'

// Adjust intensity
hero.setIntensity(0.5); // 0-1 range

// Trigger pulse animation
hero.triggerPulse(0, 1); // from node 0 to node 1

// Clean up resources
hero.destroy();
```

## 🧪 Testing

Run the test suite in development:
```javascript
// Automatic testing on localhost
// Or manual testing:
window.HeroCanvasTests.runAll();
```

Tests include:
- Render validation
- Memory cleanup  
- Accessibility compliance
- Performance benchmarks
- Theme switching

## ⚡ Performance Targets

- **Desktop**: 60 FPS with full effects
- **Mobile**: 30+ FPS with adaptive quality
- **Memory**: <50MB GPU memory usage
- **Load Time**: <2s to first frame

## 🎯 Integration

The hero canvas automatically initializes when:
1. DOM is ready
2. `#hero-canvas` container exists
3. WebGL is supported

Fallback activates when:
- WebGL unavailable
- `prefers-reduced-motion: reduce`
- Performance below thresholds
- Mobile with limited resources

## 🔧 Configuration

Colors and behavior automatically adapt to:
- Document body theme class (`light-theme` / `dark-theme`)
- CSS custom properties for brand colors
- User motion preferences
- Device capabilities

## 🚨 Error Handling

- WebGL context loss → automatic recovery or fallback
- Shader compilation errors → graceful degradation
- Performance issues → adaptive quality reduction
- Network failures → static fallback display
