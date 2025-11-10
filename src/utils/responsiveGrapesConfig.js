/* ──────────────────────────────────────────────────────────────
   responsiveGrapesConfig.js
   ------------------------------------------------------------------
   Enhanced GrapesJS configuration for responsive template building.
   Includes viewport-aware sizing, responsive units, and better text handling.
   ------------------------------------------------------------------ */

import { 
  pixelsToViewport, 
  responsiveFontSize, 
  convertToResponsiveStyles,
  BASE_DIMENSIONS,
  TYPOGRAPHY_SCALE 
} from '../utils/responsiveScaling';

// Enhanced editor configuration with responsive features
export const RESPONSIVE_EDITOR_CONFIG = {
  height: '100%',
  width: 'auto',
  
  // Responsive canvas configuration
  canvas: {
    styles: ['/src/styles/responsiveDisplay.css'],
    scripts: ['/src/utils/responsiveScaling.js'],
  },
  
  // Enhanced style manager with responsive controls
  styleManager: {
    appendTo: '.styles-container',
    sectors: [
      {
        name: 'Typography',
        open: true,
        buildProps: [
          'font-family', 'font-size', 'font-weight', 'font-style', 
          'text-align', 'text-decoration', 'color', 'line-height',
          'letter-spacing', 'text-transform'
        ],
        properties: [
          {
            name: 'Font Size',
            property: 'font-size',
            type: 'select',
            defaults: 'var(--font-md)',
            options: [
              { value: 'var(--font-xs)', name: 'Extra Small (Responsive)' },
              { value: 'var(--font-sm)', name: 'Small (Responsive)' },
              { value: 'var(--font-md)', name: 'Medium (Responsive)' },
              { value: 'var(--font-lg)', name: 'Large (Responsive)' },
              { value: 'var(--font-xl)', name: 'Extra Large (Responsive)' },
              { value: 'var(--font-xxl)', name: 'Display (Responsive)' },
            ],
          },
          {
            name: 'Custom Font Size',
            property: 'font-size',
            type: 'integer',
            units: ['px', 'vw', 'vh', 'rem', 'em'],
            min: 8,
            max: 200,
          }
        ]
      },
      {
        name: 'Layout & Spacing',
        open: true,
        buildProps: [
          'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
          'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
          'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
          'top', 'right', 'bottom', 'left', 'position', 'z-index'
        ],
        properties: [
          {
            name: 'Width',
            property: 'width',
            type: 'integer',
            units: ['px', 'vw', '%', 'auto'],
            min: 0,
            max: 100,
          },
          {
            name: 'Height', 
            property: 'height',
            type: 'integer',
            units: ['px', 'vh', '%', 'auto'],
            min: 0,
            max: 100,
          }
        ]
      },
      {
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
            name: 'Max Reduction',
            property: 'data-max-reduction',
            type: 'slider',
            defaults: 30,
            min: 10,
            max: 70,
            step: 5
          }
        ]
      },
      {
        name: 'Background',
        open: false,
        buildProps: [
          'background-color', 'background-image', 'background-repeat',
          'background-position', 'background-size', 'background-attachment'
        ]
      },
      {
        name: 'Border & Effects',
        open: false,
        buildProps: [
          'border-width', 'border-style', 'border-color', 'border-radius',
          'box-shadow', 'opacity', 'transform'
        ]
      }
    ]
  },
  
  // Enhanced device manager with responsive presets
  deviceManager: {
    devices: [
      {
        name: 'Desktop HD',
        width: '1920px',
        height: '1080px',
        widthMedia: 1920
      },
      {
        name: 'Desktop',
        width: '1366px',
        height: '768px', 
        widthMedia: 1366
      },
      {
        name: 'Tablet Landscape',
        width: '1024px',
        height: '768px',
        widthMedia: 1024
      },
      {
        name: 'Tablet Portrait',
        width: '768px',
        height: '1024px',
        widthMedia: 768
      },
      {
        name: 'Mobile Landscape',
        width: '667px',
        height: '375px',
        widthMedia: 667
      },
      {
        name: 'Mobile Portrait',
        width: '375px',
        height: '667px',
        widthMedia: 375
      }
    ]
  },

  // Enhanced panels with responsive tools
  panels: {
    defaults: [
      {
        id: 'layers',
        el: '.panel__right',
        resizable: {
          maxDim: 350,
          minDim: 200,
          tc: 0,
          cl: 1,
          cr: 0,
          bc: 0,
          keyWidth: 'flex-basis',
        },
      },
      {
        id: 'styles',
        el: '.panel__right',
        resizable: {
          maxDim: 350,
          minDim: 200,
          tc: 0,
          cl: 1,
          cr: 0,
          bc: 0,
          keyWidth: 'flex-basis',
        },
      },
      {
        id: 'devices-c',
        el: '.panel__top',
        buttons: [
          {
            id: 'device-desktop-hd',
            label: 'HD',
            command: 'set-device-desktop-hd',
            active: true,
            togglable: false,
          },
          {
            id: 'device-desktop',
            label: 'Desktop',
            command: 'set-device-desktop',
            togglable: false,
          },
          {
            id: 'device-tablet-landscape',
            label: 'Tablet L',
            command: 'set-device-tablet-landscape',
            togglable: false,
          },
          {
            id: 'device-tablet-portrait',
            label: 'Tablet P',
            command: 'set-device-tablet-portrait',
            togglable: false,
          },
          {
            id: 'device-mobile-landscape',
            label: 'Mobile L',
            command: 'set-device-mobile-landscape',
            togglable: false,
          },
          {
            id: 'device-mobile-portrait',
            label: 'Mobile P',
            command: 'set-device-mobile-portrait',
            togglable: false,
          }
        ]
      },
      {
        id: 'responsive-tools',
        el: '.panel__top',
        buttons: [
          {
            id: 'convert-to-responsive',
            label: 'Make Responsive',
            command: 'convert-to-responsive',
            className: 'btn-responsive-convert'
          },
          {
            id: 'optimize-text',
            label: 'Optimize Text',
            command: 'optimize-text-sizing',
            className: 'btn-text-optimize'
          },
          {
            id: 'preview-orientations',
            label: 'Test Orientations',
            command: 'preview-orientations',
            className: 'btn-orientation-test'
          }
        ]
      }
    ]
  }
};

/**
 * Enhanced component configuration with responsive defaults
 */
export function createResponsiveComponent(type, options = {}) {
  const baseConfig = {
    draggable: true,
    resizable: {
      handles: ['tl', 'tr', 'bl', 'br', 'ml', 'mr', 'mt', 'mb'],
      minWidth: 20,
      minHeight: 20,
      keepAutoHeight: true,
      keepAutoWidth: true,
    },
    stylable: true,
    hoverable: true,
    selectable: true,
  };

  switch (type) {
    case 'text':
      return {
        ...baseConfig,
        type: 'text',
        tagName: 'div',
        editable: true,
        style: {
          position: 'absolute',
          'font-size': 'var(--font-md)',
          'font-family': 'Arial, sans-serif',
          'font-weight': 'bold',
          'color': '#FFFFFF',
          'text-align': 'center',
          'line-height': '1.2',
          'word-wrap': 'break-word',
          'overflow-wrap': 'break-word',
          cursor: 'move',
          'user-select': 'none',
          ...options.style
        },
        attributes: {
          'data-text-fit': 'auto',
          'data-min-font-size': '12',
          'data-max-reduction': '30',
          ...options.attributes
        },
        ...options
      };

    case 'image':
      return {
        ...baseConfig,
        type: 'image',
        style: {
          position: 'absolute',
          'max-width': '100%',
          'height': 'auto',
          'object-fit': 'contain',
          cursor: 'move',
          ...options.style
        },
        ...options
      };

    default:
      return { ...baseConfig, ...options };
  }
}

/**
 * Custom commands for responsive functionality
 */
export const RESPONSIVE_COMMANDS = {
  'convert-to-responsive': {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) {
        alert('Please select a component first');
        return;
      }

      const styles = selected.getStyle();
      const responsiveStyles = convertToResponsiveStyles(styles);
      
      // Apply responsive styles
      selected.setStyle(responsiveStyles);
      
      // Add responsive classes
      const classList = selected.getClasses();
      if (!classList.includes('text-responsive')) {
        selected.addClass('text-responsive');
      }

      editor.trigger('component:update', selected);
      console.log('Converted component to responsive:', responsiveStyles);
    }
  },

  'optimize-text-sizing': {
    run(editor) {
      const components = editor.getWrapper().find('*');
      let optimizedCount = 0;

      components.forEach(component => {
        const attrs = component.getAttributes();
        if (attrs['data-placeholder'] || component.get('type') === 'text') {
          const styles = component.getStyle();
          
          // Convert font-size to responsive if it's in pixels
          if (styles['font-size'] && styles['font-size'].includes('px')) {
            const pixels = parseFloat(styles['font-size']);
            let scale = 'md';
            
            // Map pixel values to responsive scales
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
            
            // Add text fitting attributes
            component.addAttributes({
              'data-text-fit': 'auto',
              'data-min-font-size': '12',
              'data-max-reduction': '30'
            });
            
            optimizedCount++;
          }
        }
      });

      alert(`Optimized ${optimizedCount} text components for responsive display`);
    }
  },

  'preview-orientations': {
    run(editor) {
      const canvas = editor.Canvas;
      const iframe = canvas.getFrameEl();
      
      if (!iframe) {
        alert('Canvas not ready for preview');
        return;
      }

      // Store current dimensions
      const originalWidth = iframe.style.width;
      const originalHeight = iframe.style.height;
      
      let step = 0;
      const steps = [
        { width: '1920px', height: '1080px', name: 'Landscape HD' },
        { width: '1080px', height: '1920px', name: 'Portrait HD' },
        { width: '1366px', height: '768px', name: 'Laptop' },
        { width: '768px', height: '1366px', name: 'Tablet Portrait' },
        { width: '667px', height: '375px', name: 'Mobile Landscape' },
        { width: '375px', height: '667px', name: 'Mobile Portrait' }
      ];
      
      const previewStep = () => {
        if (step >= steps.length) {
          // Reset to original
          iframe.style.width = originalWidth;
          iframe.style.height = originalHeight;
          alert('Orientation preview complete');
          return;
        }
        
        const current = steps[step];
        iframe.style.width = current.width;
        iframe.style.height = current.height;
        
        setTimeout(() => {
          if (confirm(`${current.name} (${current.width} × ${current.height})\nClick OK for next orientation or Cancel to stop`)) {
            step++;
            previewStep();
          } else {
            // Reset to original
            iframe.style.width = originalWidth;
            iframe.style.height = originalHeight;
          }
        }, 500);
      };
      
      previewStep();
    }
  }
};

/**
 * Enhanced block configuration for responsive components
 */
export function createResponsiveBlocks(userImages = []) {
  const blocks = [
    // Responsive text blocks
    ...Object.keys(TYPOGRAPHY_SCALE).map(scale => ({
      id: `responsive-text-${scale}`,
      label: `Text ${scale.toUpperCase()}`,
      category: 'Responsive Text',
      content: `<div data-placeholder="text_${scale}" class="text-${scale}">Sample Text</div>`,
      attributes: {
        'data-placeholder': `text_${scale}`,
        'data-text-fit': 'auto',
        'data-min-font-size': '12',
        'data-max-reduction': '30'
      }
    })),

    // Standard placeholder blocks with responsive enhancements
    {
      id: 'runner-name',
      label: 'Runner Name',
      category: 'Runner Data',
      content: '<div data-placeholder="runner_name" class="text-lg">{{runner_name}}</div>',
      attributes: { 
        'data-placeholder': 'runner_name',
        'data-text-fit': 'auto',
        'data-max-reduction': '40' // Names can be reduced more
      }
    },
    {
      id: 'bib-number',
      label: 'Bib Number',
      category: 'Runner Data', 
      content: '<div data-placeholder="bib_number" class="text-xl">{{bib_number}}</div>',
      attributes: { 
        'data-placeholder': 'bib_number',
        'data-text-fit': 'shrink' // Bib numbers should shrink, not wrap
      }
    },
    {
      id: 'finish-time',
      label: 'Finish Time',
      category: 'Runner Data',
      content: '<div data-placeholder="finish_time" class="text-lg">{{finish_time}}</div>',
      attributes: { 
        'data-placeholder': 'finish_time',
        'data-text-fit': 'shrink'
      }
    },

    // Responsive image blocks
    ...userImages.map(image => ({
      id: `responsive-image-${image.id}`,
      label: image.filename,
      category: 'Responsive Images',
      content: `<img src="${image.url}" alt="${image.filename}" class="responsive-image" />`,
      attributes: {
        'data-image-url': image.url,
        'data-image-id': image.id,
        'data-image-filename': image.filename,
        'data-responsive': 'true'
      }
    }))
  ];

  return blocks;
}

export default {
  RESPONSIVE_EDITOR_CONFIG,
  createResponsiveComponent,
  RESPONSIVE_COMMANDS,
  createResponsiveBlocks
};