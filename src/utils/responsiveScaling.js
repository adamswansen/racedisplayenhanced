/* ──────────────────────────────────────────────────────────────
   responsiveScaling.js
   ------------------------------------------------------------------
   Unified responsive scaling system for race display templates.
   Handles viewport units, dynamic text sizing, and orientation changes.
   ------------------------------------------------------------------ */

// Base design dimensions - templates are designed for 16:9 landscape
export const BASE_DIMENSIONS = {
  width: 1920,
  height: 1080,
  aspectRatio: 16/9
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  large: 1920
};

// Typography scale using viewport units
export const TYPOGRAPHY_SCALE = {
  xs: { vw: 1.5, min: 12, max: 18 },    // Small text
  sm: { vw: 2.0, min: 14, max: 24 },    // Body text  
  md: { vw: 3.0, min: 18, max: 36 },    // Subheadings
  lg: { vw: 4.0, min: 24, max: 48 },    // Headings
  xl: { vw: 5.0, min: 32, max: 64 },    // Large headings
  xxl: { vw: 6.0, min: 40, max: 80 }    // Display text
};

/**
 * Convert pixel values to viewport-relative units with fallbacks
 * @param {number} pixels - Original pixel value
 * @param {string} unit - Target unit ('vw', 'vh', 'vmin', 'vmax')
 * @param {number} baseViewport - Base viewport size (default: 1920 for vw, 1080 for vh)
 * @returns {string} CSS value with clamp() for min/max constraints
 */
export function pixelsToViewport(pixels, unit = 'vw', baseViewport = null) {
  const base = baseViewport || (unit.includes('h') ? BASE_DIMENSIONS.height : BASE_DIMENSIONS.width);
  const vwValue = (pixels / base) * 100;
  
  // Create responsive value with min/max constraints
  const minPx = Math.max(pixels * 0.5, 8); // Never smaller than 8px or 50% of original
  const maxPx = pixels * 2; // Never larger than 200% of original
  
  return `clamp(${minPx}px, ${vwValue.toFixed(2)}${unit}, ${maxPx}px)`;
}

/**
 * Create responsive font size using typography scale
 * @param {string} scale - Typography scale key (xs, sm, md, lg, xl, xxl)
 * @param {number} multiplier - Optional multiplier (default: 1)
 * @returns {string} CSS clamp value
 */
export function responsiveFontSize(scale = 'md', multiplier = 1) {
  const config = TYPOGRAPHY_SCALE[scale] || TYPOGRAPHY_SCALE.md;
  const vwValue = config.vw * multiplier;
  const minValue = config.min * multiplier;
  const maxValue = config.max * multiplier;
  
  return `clamp(${minValue}px, ${vwValue}vw, ${maxValue}px)`;
}

/**
 * Get optimal container dimensions based on viewport and orientation
 * @param {number} viewportWidth - Current viewport width
 * @param {number} viewportHeight - Current viewport height
 * @param {boolean} forceOrientation - Force specific orientation ('landscape'|'portrait'|null)
 * @returns {object} Optimal dimensions and scale
 */
export function getOptimalDimensions(viewportWidth, viewportHeight, forceOrientation = null) {
  const currentAspectRatio = viewportWidth / viewportHeight;
  const isLandscape = currentAspectRatio > 1;
  
  let targetWidth, targetHeight, orientation;
  
  if (forceOrientation === 'landscape' || (!forceOrientation && isLandscape)) {
    // Landscape mode
    orientation = 'landscape';
    if (currentAspectRatio >= BASE_DIMENSIONS.aspectRatio) {
      // Viewport is wider than 16:9 - fit to height
      targetHeight = viewportHeight;
      targetWidth = targetHeight * BASE_DIMENSIONS.aspectRatio;
    } else {
      // Viewport is narrower than 16:9 - fit to width  
      targetWidth = viewportWidth;
      targetHeight = targetWidth / BASE_DIMENSIONS.aspectRatio;
    }
  } else {
    // Portrait mode - rotate base dimensions
    orientation = 'portrait';
    const portraitAspectRatio = BASE_DIMENSIONS.height / BASE_DIMENSIONS.width; // 9:16
    
    if (currentAspectRatio >= portraitAspectRatio) {
      // Viewport is wider than 9:16 - fit to height
      targetHeight = viewportHeight;
      targetWidth = targetHeight * portraitAspectRatio;
    } else {
      // Viewport is narrower than 9:16 - fit to width
      targetWidth = viewportWidth;
      targetHeight = targetWidth / portraitAspectRatio;
    }
  }
  
  const scale = Math.min(targetWidth / BASE_DIMENSIONS.width, targetHeight / BASE_DIMENSIONS.height);
  
  return {
    width: targetWidth,
    height: targetHeight,
    scale,
    orientation,
    offsetX: (viewportWidth - targetWidth) / 2,
    offsetY: (viewportHeight - targetHeight) / 2
  };
}

/**
 * Generate CSS custom properties for responsive scaling
 * @param {object} dimensions - Dimensions from getOptimalDimensions
 * @param {object} options - Additional options
 * @returns {object} CSS custom properties
 */
export function generateScaleProperties(dimensions, options = {}) {
  const { 
    enableTextScaling = true,
    textScaleMultiplier = 1,
    enableSpacingScale = true 
  } = options;
  
  const properties = {
    '--display-width': `${dimensions.width}px`,
    '--display-height': `${dimensions.height}px`,
    '--display-scale': dimensions.scale,
    '--display-offset-x': `${dimensions.offsetX}px`,
    '--display-offset-y': `${dimensions.offsetY}px`,
    '--display-orientation': dimensions.orientation
  };
  
  // Add typography custom properties
  if (enableTextScaling) {
    Object.keys(TYPOGRAPHY_SCALE).forEach(scale => {
      const cssVar = `--font-${scale}`;
      properties[cssVar] = responsiveFontSize(scale, textScaleMultiplier);
    });
  }
  
  // Add spacing scale
  if (enableSpacingScale) {
    const spacingBase = 8; // 8px base spacing
    for (let i = 1; i <= 10; i++) {
      properties[`--spacing-${i}`] = pixelsToViewport(spacingBase * i, 'vmin');
    }
  }
  
  return properties;
}

/**
 * Smart text fitting that preserves readability
 * @param {HTMLElement} element - Text element to fit
 * @param {object} options - Fitting options
 * @returns {object} Applied sizing information
 */
export function intelligentTextFit(element, options = {}) {
  const {
    maxReduction = 0.7, // Don't go below 70% of original size
    minFontSize = 12,   // Absolute minimum font size
    preferWordWrap = true, // Try word wrapping before shrinking
    respectLineHeight = true,
    step = 0.02 // Smaller steps for smoother scaling (2% instead of 5%)
  } = options;
  
  if (!element) return null;
  
  // Get original computed styles
  const originalStyles = window.getComputedStyle(element);
  const originalFontSize = parseFloat(originalStyles.fontSize);
  const originalLineHeight = parseFloat(originalStyles.lineHeight) || originalFontSize * 1.2;
  
  // Store original values if not already stored
  if (!element.dataset.originalFontSize) {
    element.dataset.originalFontSize = originalFontSize;
    element.dataset.originalLineHeight = originalLineHeight;
  }
  
  const containerWidth = element.clientWidth;
  const containerHeight = element.clientHeight;
  const originalText = element.textContent;
  
  // Try word wrapping first if enabled
  if (preferWordWrap && originalText.includes(' ')) {
    element.style.whiteSpace = 'normal';
    element.style.wordBreak = 'break-word';
    element.style.overflowWrap = 'break-word';
    
    // Check if word wrapping solved the problem
    if (element.scrollWidth <= containerWidth && element.scrollHeight <= containerHeight) {
      return {
        method: 'word-wrap',
        fontSize: originalFontSize,
        reduction: 0,
        fits: true
      };
    }
  }
  
  // If word wrapping didn't work or wasn't preferred, try font reduction
  element.style.whiteSpace = 'nowrap';
  let currentFontSize = originalFontSize;
  const minAllowedSize = Math.max(minFontSize, originalFontSize * maxReduction);
  
  let attempts = 0;
  const maxAttempts = 50;
  
  while (element.scrollWidth > containerWidth && currentFontSize > minAllowedSize && attempts < maxAttempts) {
    currentFontSize = currentFontSize * (1 - step);
    element.style.fontSize = `${currentFontSize}px`;
    
    if (respectLineHeight) {
      const lineHeightRatio = originalLineHeight / originalFontSize;
      element.style.lineHeight = `${currentFontSize * lineHeightRatio}px`;
    }
    
    attempts++;
  }
  
  const reduction = (originalFontSize - currentFontSize) / originalFontSize;
  const fits = element.scrollWidth <= containerWidth;
  
  // If text still doesn't fit even at minimum size, enable word wrapping as fallback
  if (!fits && preferWordWrap) {
    element.style.whiteSpace = 'normal';
    element.style.wordBreak = 'break-word';
    element.style.overflowWrap = 'break-word';
  }
  
  return {
    method: fits ? 'font-reduction' : 'hybrid',
    fontSize: currentFontSize,
    reduction,
    fits: element.scrollWidth <= containerWidth && element.scrollHeight <= containerHeight,
    attempts
  };
}

/**
 * Apply responsive scaling to a template container
 * @param {HTMLElement} container - Template container element
 * @param {object} options - Scaling options
 */
export function applyResponsiveScaling(container, options = {}) {
  if (!container) return;
  
  const {
    viewportWidth = window.innerWidth,
    viewportHeight = window.innerHeight,
    forceOrientation = null,
    enableSmartTextFit = true,
    textFitOptions = {}
  } = options;
  
  // Calculate optimal dimensions
  const dimensions = getOptimalDimensions(viewportWidth, viewportHeight, forceOrientation);
  
  // Generate CSS custom properties
  const properties = generateScaleProperties(dimensions, options);
  
  // Apply properties to container
  Object.entries(properties).forEach(([property, value]) => {
    container.style.setProperty(property, value);
  });
  
  // Apply transform for centering and scaling
  const transform = `translate(${dimensions.offsetX}px, ${dimensions.offsetY}px) scale(${dimensions.scale})`;
  container.style.transform = transform;
  container.style.transformOrigin = 'top left';
  
  // Apply smart text fitting to all text elements
  if (enableSmartTextFit) {
    const textElements = container.querySelectorAll('[data-placeholder], .text-element, h1, h2, h3, h4, h5, h6, p, span');
    textElements.forEach(element => {
      if (element.textContent && element.textContent.trim()) {
        intelligentTextFit(element, textFitOptions);
      }
    });
  }
  
  return {
    dimensions,
    properties,
    transform
  };
}

/**
 * Create a responsive observer for dynamic scaling updates
 * @param {HTMLElement} container - Container to observe
 * @param {function} callback - Callback for updates
 * @param {object} options - Observer options
 * @returns {function} Cleanup function
 */
export function createResponsiveObserver(container, callback, options = {}) {
  let resizeTimeout;
  const { debounceMs = 150 } = options;

  const scheduleResize = (extraDelay = 0) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const result = applyResponsiveScaling(container, options);
      if (callback) callback(result);
    }, debounceMs + extraDelay);
  };

  const handleResize = () => {
    scheduleResize();
  };

  const handleOrientationChange = () => {
    // Allow the viewport to settle before recalculating sizes
    scheduleResize(100);
  };

  // Listen for resize events
  window.addEventListener('resize', handleResize);

  // Listen for orientation changes
  window.addEventListener('orientationchange', handleOrientationChange);

  // Initial application
  handleResize();

  // Return cleanup function
  return () => {
    clearTimeout(resizeTimeout);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
  };
}

/**
 * Generate responsive CSS for template elements
 * @param {object} styles - Original styles object
 * @param {string} orientation - Target orientation ('landscape'|'portrait'|'auto')
 * @returns {object} Converted responsive styles
 */
export function convertToResponsiveStyles(styles, orientation = 'auto') {
  const responsiveStyles = { ...styles };
  
  // Convert font-size
  if (styles['font-size']) {
    const pixels = parseFloat(styles['font-size']);
    if (!isNaN(pixels)) {
      // Determine scale based on size
      let scale = 'md';
      if (pixels <= 16) scale = 'xs';
      else if (pixels <= 20) scale = 'sm';
      else if (pixels <= 32) scale = 'md';
      else if (pixels <= 48) scale = 'lg';
      else if (pixels <= 64) scale = 'xl';
      else scale = 'xxl';
      
      responsiveStyles['font-size'] = `var(--font-${scale}, ${responsiveFontSize(scale)})`;
    }
  }
  
  return responsiveStyles;
}

export default {
  BASE_DIMENSIONS,
  BREAKPOINTS,
  TYPOGRAPHY_SCALE,
  pixelsToViewport,
  responsiveFontSize,
  getOptimalDimensions,
  generateScaleProperties,
  intelligentTextFit,
  applyResponsiveScaling,
  createResponsiveObserver,
  convertToResponsiveStyles
};