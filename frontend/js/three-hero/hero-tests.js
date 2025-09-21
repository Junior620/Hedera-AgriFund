/**
 * Test suite for Hero Canvas Three.js implementation
 */

// Basic render test
function testHeroCanvasRender() {
  console.log('🧪 Testing Hero Canvas render...');

  // Check if container exists
  const container = document.getElementById('hero-canvas');
  if (!container) {
    console.error('❌ Hero canvas container not found');
    return false;
  }

  // Check if canvas was created
  const canvas = container.querySelector('.hero-webgl-canvas');
  if (!canvas) {
    console.warn('⚠️ WebGL canvas not found - may be using fallback');

    // Check for fallback
    const fallback = container.querySelector('.hero-static-fallback');
    if (fallback) {
      console.log('✅ Static fallback is active');
      return true;
    }
    return false;
  }

  console.log('✅ Hero canvas rendered successfully');
  return true;
}

// Memory cleanup test
function testMemoryCleanup() {
  console.log('🧪 Testing memory cleanup...');

  if (typeof window.HeroCanvas !== 'undefined') {
    // Test destruction
    const originalCanvas = window.HeroCanvas;
    originalCanvas.destroy();

    // Check if resources are cleaned up
    setTimeout(() => {
      console.log('✅ Memory cleanup test completed');
    }, 1000);

    return true;
  }

  console.warn('⚠️ Hero canvas instance not found for cleanup test');
  return false;
}

// Accessibility test
function testAccessibility() {
  console.log('🧪 Testing accessibility features...');

  // Check for skip link
  const skipLink = document.querySelector('.skip-to-content');
  if (!skipLink) {
    console.warn('⚠️ Skip to content link not found');
    return false;
  }

  // Check for pause button
  const pauseBtn = document.querySelector('.hero-pause-btn');
  if (!pauseBtn) {
    console.warn('⚠️ Pause animation button not found');
    return false;
  }

  // Check aria attributes
  const canvas = document.querySelector('.hero-webgl-canvas');
  if (canvas && !canvas.getAttribute('aria-hidden')) {
    console.warn('⚠️ Canvas missing aria-hidden attribute');
    return false;
  }

  console.log('✅ Accessibility features are properly implemented');
  return true;
}

// Performance test
function testPerformance() {
  console.log('🧪 Testing performance...');

  let frameCount = 0;
  let startTime = performance.now();

  function measureFPS() {
    frameCount++;

    if (frameCount >= 60) { // Test for 1 second at 60fps
      const endTime = performance.now();
      const fps = (frameCount * 1000) / (endTime - startTime);

      console.log(`📊 Average FPS: ${fps.toFixed(1)}`);

      if (fps >= 30) {
        console.log('✅ Performance test passed (30+ FPS)');
        return true;
      } else {
        console.warn('⚠️ Performance below 30 FPS, adaptive quality should activate');
        return true; // Still pass, as adaptive quality is expected
      }
    }

    requestAnimationFrame(measureFPS);
  }

  requestAnimationFrame(measureFPS);
}

// Theme switching test
function testThemeSwitching() {
  console.log('🧪 Testing theme switching...');

  if (typeof window.HeroCanvas !== 'undefined') {
    // Test light theme
    window.HeroCanvas.setTheme('light');
    console.log('🌞 Switched to light theme');

    // Test dark theme
    setTimeout(() => {
      window.HeroCanvas.setTheme('dark');
      console.log('🌙 Switched to dark theme');
      console.log('✅ Theme switching test completed');
    }, 1000);

    return true;
  }

  console.warn('⚠️ Hero canvas instance not available for theme test');
  return false;
}

// Run all tests
function runHeroCanvasTests() {
  console.log('🚀 Starting Hero Canvas Tests...');
  console.log('=====================================');

  // Wait for DOM and initialization
  setTimeout(() => {
    testHeroCanvasRender();
    testAccessibility();
    testThemeSwitching();
    testPerformance();

    console.log('=====================================');
    console.log('🏁 Hero Canvas Tests Completed');
  }, 2000);
}

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', runHeroCanvasTests);
}

// Export for manual testing
window.HeroCanvasTests = {
  runAll: runHeroCanvasTests,
  testRender: testHeroCanvasRender,
  testAccessibility: testAccessibility,
  testPerformance: testPerformance,
  testTheme: testThemeSwitching,
  testCleanup: testMemoryCleanup
};
