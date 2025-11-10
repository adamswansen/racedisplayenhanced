import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  applyResponsiveScaling, 
  createResponsiveObserver, 
  intelligentTextFit 
} from '../utils/responsiveScaling';
import '../styles/responsiveDisplay.css';

// Debug flag - set to false to disable logging in production
const DEBUG_LOGGING = false;
const debugLog = (...args) => {
  if (DEBUG_LOGGING) {
    console.log(...args);
  }
};

export default function RunnerDisplayEnhanced({ runner, template }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayRunner, setDisplayRunner] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [processedTemplate, setProcessedTemplate] = useState(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const processingRef = useRef(false);
  const responsiveCleanupRef = useRef(null);

  // Enhanced text fitting that respects responsive design
  const smartTextFit = useCallback((element, options = {}) => {
    if (!element) return null;

    // Get text fitting configuration from element attributes
    const textFitMode = element.getAttribute('data-text-fit') || 'auto';
    const minFontSize = parseInt(element.getAttribute('data-min-font-size')) || 12;
    const maxReduction = parseInt(element.getAttribute('data-max-reduction')) || 30;

    const fitOptions = {
      maxReduction: maxReduction / 100, // Convert percentage to decimal
      minFontSize,
      preferWordWrap: textFitMode === 'wrap' || textFitMode === 'auto',
      ...options
    };

    // Apply CSS class based on text fit mode
    element.classList.remove('text-fit-shrink', 'text-fit-wrap', 'text-fit-ellipsis');
    
    switch (textFitMode) {
      case 'shrink':
        element.classList.add('text-fit-shrink');
        fitOptions.preferWordWrap = false;
        break;
      case 'wrap':
        element.classList.add('text-fit-wrap');
        return { method: 'css-wrap', fits: true }; // Let CSS handle wrapping
      case 'ellipsis':
        element.classList.add('text-fit-ellipsis');
        return { method: 'css-ellipsis', fits: true }; // Let CSS handle ellipsis
      case 'none':
        return { method: 'none', fits: true }; // No fitting
      default:
        // Auto mode - intelligent fitting
        break;
    }

    return intelligentTextFit(element, fitOptions);
  }, []);

  // Enhanced template preprocessing with responsive awareness
  const preprocessTemplate = useCallback((runnerData, templateData) => {
    if (!templateData) return null;

    debugLog('[ResponsiveRunnerDisplay] Pre-processing template:', {
      hasRunnerData: !!runnerData,
      runnerName: runnerData?.first_name || runnerData?.name
    });
    
    // Create a temporary DOM container
    const tempContainer = document.createElement('div');
    tempContainer.className = 'responsive-display-container';
    tempContainer.innerHTML = `
      <div class="responsive-display-content">
        <div class="layout-root">
          ${templateData.html || ''}
        </div>
      </div>
    `;
    
    // Add template CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = templateData.css || '';
    tempContainer.appendChild(styleElement);
    
    // Temporarily add to document for measurements
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);
    
    try {
      // Apply responsive scaling to the temp container
      applyResponsiveScaling(tempContainer, {
        enableSmartTextFit: false // We'll handle text fitting later
      });

      // Find and process all placeholders
      const placeholders = tempContainer.querySelectorAll('[data-placeholder]');
      
      placeholders.forEach(node => {
        const key = node.getAttribute('data-placeholder');
        let value = runnerData?.[key];
        
        // Handle special mappings
        if (key === 'message' && !value) {
          value = runnerData?.custom_message || '';
        }
        
        debugLog(`[ResponsiveRunnerDisplay] Processing placeholder ${key}:`, value);
        
        if (node.tagName === 'IMG') {
          if (value) {
            node.src = value;
            node.alt = `${key} image`;
            node.style.display = '';
          } else {
            node.src = '';
            node.style.display = 'none';
          }
        } else {
          if (value !== undefined && value !== null && value.toString().trim()) {
            node.textContent = value;
            
            // Apply smart text fitting if the element has content
            debugLog(`[ResponsiveRunnerDisplay] Applying text fit to ${key}`);
            const fitResult = smartTextFit(node);
            debugLog(`[ResponsiveRunnerDisplay] Text fit result for ${key}:`, fitResult);
          } else {
            node.textContent = ''; // Clear placeholder, don't show raw template
          }
        }
      });

      // Process animations
      const animatedElements = tempContainer.querySelectorAll('[data-anim]');
      animatedElements.forEach(node => {
        const anim = node.getAttribute('data-anim');
        if (anim && anim.trim() !== '') {
          const duration = parseInt(node.getAttribute('data-anim-dur')) || 1000;
          const delay = parseInt(node.getAttribute('data-anim-delay')) || 0;
          
          // Sanitize animation name
          const sanitizedAnim = anim.trim().replace(/\s+/g, '');
          
          // Add animation classes
          node.classList.add('animate__animated', `animate__${sanitizedAnim}`);
          node.style.setProperty('--animate-duration', `${duration}ms`);
          node.style.setProperty('--animate-delay', `${delay}ms`);
        }
      });

      // Get the processed HTML
      const contentElement = tempContainer.querySelector('.layout-root');
      const processedHtml = contentElement ? contentElement.innerHTML : tempContainer.innerHTML;
      
      return {
        html: processedHtml,
        css: templateData.css,
        canvasWidth: templateData.canvasWidth,
        canvasHeight: templateData.canvasHeight,
        backgroundStyles: templateData.backgroundStyles
      };
      
    } finally {
      // Clean up temporary element
      document.body.removeChild(tempContainer);
    }
  }, [smartTextFit]);

  // Handle runner data changes with enhanced processing
  useEffect(() => {
    if (!template) return;

    debugLog('[ResponsiveRunnerDisplay] Runner or template changed:', {
      hasRunner: !!runner,
      runnerName: runner?.first_name || runner?.name,
      hasTemplate: !!template
    });
    
    // Prevent concurrent processing
    if (processingRef.current) {
      debugLog('[ResponsiveRunnerDisplay] Already processing, skipping update');
      return;
    }

    processingRef.current = true;
    setIsReady(false);

    try {
      let templateToProcess = template;
      
      // Handle new format with active/resting states
      if (template.activeState && template.restingState) {
        templateToProcess = runner ? template.activeState : template.restingState;
      }
      
      const processed = preprocessTemplate(runner, templateToProcess);
      
      if (processed) {
        setProcessedTemplate(processed);
        setDisplayRunner(runner);
        
        // Small delay to ensure DOM is updated before applying responsive scaling
        setTimeout(() => {
          if (contentRef.current) {
            applyResponsiveScaling(contentRef.current, {
              enableSmartTextFit: true,
              textFitOptions: {
                preferWordWrap: true,
                maxReduction: 0.3
              }
            });
          }
          setIsReady(true);
        }, 50);
      } else {
        setIsReady(true);
      }
    } catch (error) {
      console.error('[ResponsiveRunnerDisplay] Error processing template:', error);
      setIsReady(true);
    } finally {
      processingRef.current = false;
    }
  }, [runner, template, preprocessTemplate]);

  // Set up responsive observer for dynamic scaling
  useEffect(() => {
    if (!contentRef.current || !isReady) return;

    debugLog('[ResponsiveRunnerDisplay] Setting up responsive observer');
    
    // Clean up previous observer
    if (responsiveCleanupRef.current) {
      responsiveCleanupRef.current();
    }

    // Create new observer
    responsiveCleanupRef.current = createResponsiveObserver(
      contentRef.current,
      (result) => {
        debugLog('[ResponsiveRunnerDisplay] Responsive update applied:', result);
      },
      {
        debounceMs: 100,
        enableSmartTextFit: true,
        textFitOptions: {
          maxReduction: 0.4, // Allow more reduction for long names
          minFontSize: 10,
          preferWordWrap: true
        }
      }
    );

    return () => {
      if (responsiveCleanupRef.current) {
        responsiveCleanupRef.current();
        responsiveCleanupRef.current = null;
      }
    };
  }, [isReady, processedTemplate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (responsiveCleanupRef.current) {
        responsiveCleanupRef.current();
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('[ResponsiveRunnerDisplay] Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!processedTemplate) {
    return (
      <div className="responsive-display-container">
        <div className="center-content">
          <div>Loading template...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="responsive-display-container"
      style={{
        backgroundColor: processedTemplate.backgroundStyles?.backgroundColor || 'transparent'
      }}
    >
      <div 
        ref={contentRef}
        className="responsive-display-content"
        dangerouslySetInnerHTML={{
          __html: `
            <div class="layout-root">
              <style>${processedTemplate.css || ''}</style>
              ${processedTemplate.html || ''}
            </div>
          `
        }}
      />
      
      {/* Debug info for development */}
      {DEBUG_LOGGING && (
        <div className="responsive-debug">
          Runner: {displayRunner?.first_name || 'None'} | 
          Ready: {isReady ? 'Yes' : 'No'} | 
          Processing: {processingRef.current ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Fullscreen toggle */}
      <button 
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isFullscreen ? '⊖' : '⊞'}
      </button>
    </div>
  );
}