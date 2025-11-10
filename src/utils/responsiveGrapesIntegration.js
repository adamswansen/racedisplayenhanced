/* ──────────────────────────────────────────────────────────────
   responsiveGrapesIntegration.js
   ------------------------------------------------------------------
   Integration helpers to upgrade existing GrapesJS editor with 
   responsive functionality. Updates useGrapesEditor hook.
   ------------------------------------------------------------------ */

import { 
  RESPONSIVE_EDITOR_CONFIG, 
  RESPONSIVE_COMMANDS, 
  createResponsiveComponent, 
  createResponsiveBlocks 
} from './responsiveGrapesConfig';
import { convertToResponsiveStyles } from './responsiveScaling';

/**
 * Enhance existing GrapesJS editor with responsive functionality
 * @param {Object} editor - GrapesJS editor instance
 * @param {Object} options - Integration options
 */
export function enhanceEditorWithResponsive(editor, options = {}) {
  const {
    enableAutoConversion = true,
    enableResponsiveBlocks = true,
    enableResponsiveCommands = true,
    enableResponsiveStyles = true
  } = options;

  console.log('[ResponsiveIntegration] Enhancing editor with responsive features');

  // Add responsive commands
  if (enableResponsiveCommands) {
    Object.entries(RESPONSIVE_COMMANDS).forEach(([commandId, command]) => {
      editor.Commands.add(commandId, command);
    });
    console.log('[ResponsiveIntegration] Added responsive commands');
  }

  // Enhance style manager with responsive properties
  if (enableResponsiveStyles) {
    const styleManager = editor.StyleManager;
    
    // Add responsive font size options to existing font-size properties
    const fontSizeProperty = styleManager.getProperty('typography', 'font-size');
    if (fontSizeProperty) {
      fontSizeProperty.set('options', [
        { value: 'var(--font-xs)', name: 'Extra Small (Responsive)' },
        { value: 'var(--font-sm)', name: 'Small (Responsive)' },
        { value: 'var(--font-md)', name: 'Medium (Responsive)' },
        { value: 'var(--font-lg)', name: 'Large (Responsive)' },
        { value: 'var(--font-xl)', name: 'Extra Large (Responsive)' },
        { value: 'var(--font-xxl)', name: 'Display (Responsive)' },
        { value: '12px', name: '12px' },
        { value: '14px', name: '14px' },
        { value: '16px', name: '16px' },
        { value: '18px', name: '18px' },
        { value: '24px', name: '24px' },
        { value: '32px', name: '32px' },
        { value: '48px', name: '48px' },
      ]);
    }

    // Add responsive text sector if it doesn't exist
    const responsiveTextSector = styleManager.getSector('responsive-text');
    if (!responsiveTextSector) {
      styleManager.addSector('responsive-text', {
        name: 'Responsive Text',
        open: false,
        properties: [
          {
            name: 'Text Fitting',
            property: 'data-text-fit',
            type: 'select',
            defaults: 'auto',
            options: [
              { value: 'auto', name: 'Auto (Smart Fit)' },
              { value: 'shrink', name: 'Shrink Font' },
              { value: 'wrap', name: 'Word Wrap' },
              { value: 'ellipsis', name: 'Ellipsis' },
              { value: 'none', name: 'No Fitting' }
            ]
          },
          {
            name: 'Min Font Size',
            property: 'data-min-font-size',
            type: 'integer',
            units: ['px'],
            min: 8,
            max: 48,
            defaults: 12
          },
          {
            name: 'Max Reduction (%)',
            property: 'data-max-reduction',
            type: 'slider',
            defaults: 30,
            min: 10,
            max: 70,
            step: 5
          }
        ]
      });
    }

    console.log('[ResponsiveIntegration] Enhanced style manager');
  }

  // Add responsive blocks if enabled
  if (enableResponsiveBlocks) {
    // Get existing user images
    const blockManager = editor.BlockManager;
    const existingImageBlocks = blockManager.getAll().filter(block => {
      const category = block.get('category');
      return category && (category.id === 'Images' || category === 'Images');
    });

    // Extract image data for responsive blocks
    const userImages = existingImageBlocks.map(block => {
      const attrs = block.get('attributes') || {};
      return {
        id: attrs['data-image-id'] || block.get('id'),
        filename: attrs['data-image-filename'] || block.get('label'),
        url: attrs['data-image-url'] || ''
      };
    });

    // Create responsive blocks
    const responsiveBlocks = createResponsiveBlocks(userImages);
    
    // Add responsive blocks to editor
    responsiveBlocks.forEach(blockConfig => {
      blockManager.add(blockConfig.id, blockConfig);
    });

    console.log('[ResponsiveIntegration] Added responsive blocks');
  }

  // Auto-convert existing components if enabled
  if (enableAutoConversion) {
    const components = editor.getWrapper().find('*');
    let convertedCount = 0;

    components.forEach(component => {
      const attrs = component.getAttributes();
      const styles = component.getStyle();
      
      // Convert text components with pixel font sizes
      if (attrs['data-placeholder'] || component.get('type') === 'text') {
        if (styles['font-size'] && styles['font-size'].includes('px')) {
          const pixels = parseFloat(styles['font-size']);
          let scale = 'md';
          
          if (pixels <= 16) scale = 'xs';
          else if (pixels <= 20) scale = 'sm';  
          else if (pixels <= 32) scale = 'md';
          else if (pixels <= 48) scale = 'lg';
          else if (pixels <= 64) scale = 'xl';
          else scale = 'xxl';
          
          // Update to responsive font size
          component.setStyle({
            ...styles,
            'font-size': `var(--font-${scale})`
          });
          
          // Add responsive attributes if they don't exist
          if (!attrs['data-text-fit']) {
            component.addAttributes({
              'data-text-fit': 'auto',
              'data-min-font-size': '12',
              'data-max-reduction': '30'
            });
          }
          
          convertedCount++;
        }
      }
      
      // Convert positioning to responsive units for large values
      ['width', 'height', 'left', 'top'].forEach(prop => {
        if (styles[prop] && styles[prop].includes('px')) {
          const pixels = parseFloat(styles[prop]);
          // Only convert large pixel values to prevent tiny elements from becoming invisible
          if (pixels > 50) {
            const unit = prop.includes('width') || prop.includes('left') ? 'vw' : 'vh';
            const base = unit === 'vw' ? 1920 : 1080;
            const percentage = (pixels / base) * 100;
            const minPx = Math.max(pixels * 0.5, 20);
            const maxPx = pixels * 1.5;
            
            component.setStyle({
              ...styles,
              [prop]: `clamp(${minPx}px, ${percentage.toFixed(2)}${unit}, ${maxPx}px)`
            });
            convertedCount++;
          }
        }
      });
    });

    if (convertedCount > 0) {
      console.log(`[ResponsiveIntegration] Auto-converted ${convertedCount} components to responsive`);
    }
  }

  // Add responsive CSS to canvas
  const canvas = editor.Canvas;
  const canvasDoc = canvas.getDocument();
  const canvasHead = canvasDoc?.head;
  
  if (canvasHead) {
    // Check if responsive CSS is already loaded
    const existingResponsiveStyle = canvasHead.querySelector('#responsive-display-styles');
    
    if (!existingResponsiveStyle) {
      // Create and inject responsive CSS
      const responsiveStyleElement = canvasDoc.createElement('link');
      responsiveStyleElement.id = 'responsive-display-styles';
      responsiveStyleElement.rel = 'stylesheet';
      responsiveStyleElement.href = '/src/styles/responsiveDisplay.css';
      canvasHead.appendChild(responsiveStyleElement);
      
      // Also inject base CSS variables
      const variablesStyle = canvasDoc.createElement('style');
      variablesStyle.textContent = `
        :root {
          --font-xs: clamp(12px, 1.5vw, 18px);
          --font-sm: clamp(14px, 2vw, 24px);
          --font-md: clamp(18px, 3vw, 36px);
          --font-lg: clamp(24px, 4vw, 48px);
          --font-xl: clamp(32px, 5vw, 64px);
          --font-xxl: clamp(40px, 6vw, 80px);
        }
      `;
      canvasHead.appendChild(variablesStyle);
      
      console.log('[ResponsiveIntegration] Added responsive CSS to canvas');
    }
  }

  // Listen for component additions and auto-enhance them
  editor.on('component:add', (component) => {
    const type = component.get('type');
    const attrs = component.getAttributes();
    
    // Auto-enhance text components
    if ((type === 'text' || attrs['data-placeholder']) && !attrs['data-text-fit']) {
      component.addAttributes({
        'data-text-fit': 'auto',
        'data-min-font-size': '12',
        'data-max-reduction': '30'
      });
      
      // Set responsive font size if using pixels
      const styles = component.getStyle();
      if (styles['font-size'] && styles['font-size'].includes('px')) {
        const pixels = parseFloat(styles['font-size']);
        let scale = 'md';
        
        if (pixels <= 16) scale = 'xs';
        else if (pixels <= 20) scale = 'sm';
        else if (pixels <= 32) scale = 'md';
        else if (pixels <= 48) scale = 'lg';
        else if (pixels <= 64) scale = 'xl';
        else scale = 'xxl';
        
        component.setStyle({
          ...styles,
          'font-size': `var(--font-${scale})`
        });
      }
    }
  });

  console.log('[ResponsiveIntegration] Enhancement complete');
  
  return {
    convertToResponsive: (component) => {
      if (!component) return false;
      
      const styles = component.getStyle();
      const responsiveStyles = convertToResponsiveStyles(styles);
      component.setStyle(responsiveStyles);
      
      // Add responsive text attributes for text components
      const attrs = component.getAttributes();
      if (attrs['data-placeholder'] || component.get('type') === 'text') {
        component.addAttributes({
          'data-text-fit': 'auto',
          'data-min-font-size': '12',
          'data-max-reduction': '30'
        });
      }
      
      return true;
    },
    
    optimizeAllText: () => {
      const components = editor.getWrapper().find('*');
      let optimizedCount = 0;
      
      components.forEach(component => {
        const attrs = component.getAttributes();
        if (attrs['data-placeholder'] || component.get('type') === 'text') {
          const styles = component.getStyle();
          
          if (styles['font-size'] && styles['font-size'].includes('px')) {
            const pixels = parseFloat(styles['font-size']);
            let scale = 'md';
            
            if (pixels <= 16) scale = 'xs';
            else if (pixels <= 20) scale = 'sm';
            else if (pixels <= 32) scale = 'md';
            else if (pixels <= 48) scale = 'lg';
            else if (pixels <= 64) scale = 'xl';
            else scale = 'xxl';
            
            component.setStyle({
              ...styles,
              'font-size': `var(--font-${scale})`
            });
            
            component.addAttributes({
              'data-text-fit': 'auto',
              'data-min-font-size': '12',
              'data-max-reduction': '30'
            });
            
            optimizedCount++;
          }
        }
      });
      
      return optimizedCount;
    }
  };
}

/**
 * Get responsive enhancement status of editor
 * @param {Object} editor - GrapesJS editor instance
 * @returns {Object} Status information
 */
export function getResponsiveStatus(editor) {
  const components = editor.getWrapper().find('*');
  
  let totalComponents = 0;
  let responsiveComponents = 0;
  let textComponents = 0;
  let responsiveTextComponents = 0;
  
  components.forEach(component => {
    totalComponents++;
    
    const attrs = component.getAttributes();
    const styles = component.getStyle();
    
    // Check if component uses responsive units
    const hasResponsiveStyles = Object.values(styles).some(value => 
      value && (value.includes('var(--') || value.includes('vw') || value.includes('vh') || value.includes('clamp'))
    );
    
    if (hasResponsiveStyles) {
      responsiveComponents++;
    }
    
    // Check text components specifically
    if (attrs['data-placeholder'] || component.get('type') === 'text') {
      textComponents++;
      
      if (attrs['data-text-fit'] && hasResponsiveStyles) {
        responsiveTextComponents++;
      }
    }
  });
  
  return {
    totalComponents,
    responsiveComponents,
    textComponents,
    responsiveTextComponents,
    responsivePercentage: totalComponents > 0 ? Math.round((responsiveComponents / totalComponents) * 100) : 0,
    textResponsivePercentage: textComponents > 0 ? Math.round((responsiveTextComponents / textComponents) * 100) : 0
  };
}

export default {
  enhanceEditorWithResponsive,
  getResponsiveStatus
};