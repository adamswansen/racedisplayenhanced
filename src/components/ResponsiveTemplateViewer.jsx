import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  applyResponsiveScaling,
  createResponsiveObserver,
  getOptimalDimensions
} from '../utils/responsiveScaling';
import '../styles/responsiveDisplay.css';

// Debug flag - set to false to disable logging in production
const DEBUG_LOGGING = false;
const debugLog = (...args) => {
  if (DEBUG_LOGGING) {
    console.log(...args);
  }
};

export default function ResponsiveTemplateViewer({ 
  className, 
  html, 
  css, 
  data, 
  canvasWidth = 1920, 
  canvasHeight = 1080,
  forceOrientation = null, // 'landscape', 'portrait', or null for auto
  enableOrientationToggle = false,
  onOrientationChange = null
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [template, setTemplate] = useState(null);
  const [currentOrientation, setCurrentOrientation] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const responsiveCleanupRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to substitute template variables like {{name}}, {{bib}}, etc.
  const substituteVariables = useCallback((htmlContent, runnerData) => {
    if (!htmlContent) return htmlContent;
    
    debugLog('ResponsiveTemplateViewer: Substituting variables:', {
      hasData: !!runnerData,
      htmlLength: htmlContent.length
    });
    
    if (!runnerData) {
      debugLog('ResponsiveTemplateViewer: No runner data, clearing placeholders');
      // Clear all {{}} placeholders if no data
      return htmlContent.replace(/\{\{\w+\}\}/g, '');
    }
    
    // Only substitute if there are placeholders
    const hasPlaceholders = /\{\{\w+\}\}/.test(htmlContent);
    if (!hasPlaceholders) {
      return htmlContent;
    }
    
    // Map custom_message to message for template compatibility
    const templateData = {
      ...runnerData,
      message: runnerData.custom_message || runnerData.message || ''
    };
    
    let result = htmlContent;
    
    // Replace {{variable}} patterns with actual data
    const variablePattern = /\{\{(\w+)\}\}/g;
    result = result.replace(variablePattern, (match, variableName) => {
      const value = templateData[variableName];
      debugLog(`ResponsiveTemplateViewer: Replacing ${match} with "${value}"`);
      // Never show raw placeholders - show empty string if no data
      return value !== undefined ? value : '';
    });
    
    return result;
  }, []);

  // Load template from localStorage or props
  useEffect(() => {
    let templateData;
    
    if (html && css) {
      // Use props if provided
      templateData = {
        html,
        css,
        canvasWidth,
        canvasHeight
      };
    } else {
      // Try to load from localStorage
      const savedTemplate = localStorage.getItem('currentDisplayTemplate');
      if (savedTemplate) {
        try {
          templateData = JSON.parse(savedTemplate);
        } catch (error) {
          console.error('ResponsiveTemplateViewer: Failed to parse saved template:', error);
          return;
        }
      }
    }
    
    if (templateData) {
      debugLog('ResponsiveTemplateViewer: Loaded template:', {
        hasActiveState: !!templateData.activeState,
        hasRestingState: !!templateData.restingState,
        hasLegacyHtml: !!templateData.html,
        canvasWidth: templateData.canvasWidth,
        canvasHeight: templateData.canvasHeight
      });
      setTemplate(templateData);
    }
  }, [html, css, canvasWidth, canvasHeight]);

  // Calculate dimensions and orientation
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current || !isClient) return null;
    
    const container = containerRef.current;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;
    
    return getOptimalDimensions(viewportWidth, viewportHeight, forceOrientation);
  }, [forceOrientation, isClient]);

  // Apply responsive scaling when template or container changes
  useEffect(() => {
    if (!template || !contentRef.current || !containerRef.current || !isClient) return;

    debugLog('ResponsiveTemplateViewer: Applying responsive scaling');
    
    const newDimensions = calculateDimensions();
    if (newDimensions) {
      setDimensions(newDimensions);
      setCurrentOrientation(newDimensions.orientation);
      
      // Apply responsive scaling
      const result = applyResponsiveScaling(contentRef.current, {
        viewportWidth: containerRef.current.clientWidth,
        viewportHeight: containerRef.current.clientHeight,
        forceOrientation,
        enableSmartTextFit: true,
        textFitOptions: {
          preferWordWrap: true,
          maxReduction: 0.3
        }
      });
      
      debugLog('ResponsiveTemplateViewer: Scaling applied:', result);
      
      // Notify parent of orientation change
      if (onOrientationChange && newDimensions.orientation !== currentOrientation) {
        onOrientationChange(newDimensions.orientation);
      }
    }
  }, [template, forceOrientation, calculateDimensions, onOrientationChange, currentOrientation, isClient]);

  // Set up responsive observer for dynamic updates
  useEffect(() => {
    if (!contentRef.current || !containerRef.current || !isClient) return;

    debugLog('ResponsiveTemplateViewer: Setting up responsive observer');
    
    // Clean up previous observer
    if (responsiveCleanupRef.current) {
      responsiveCleanupRef.current();
    }

    // Create new observer with proper viewport dimensions
    responsiveCleanupRef.current = createResponsiveObserver(
      contentRef.current,
      (result) => {
        debugLog('ResponsiveTemplateViewer: Responsive update:', result);
        setDimensions(result.dimensions);
        
        if (result.dimensions.orientation !== currentOrientation) {
          setCurrentOrientation(result.dimensions.orientation);
          if (onOrientationChange) {
            onOrientationChange(result.dimensions.orientation);
          }
        }
      },
      {
        debounceMs: 150,
        viewportWidth: containerRef.current.clientWidth,
        viewportHeight: containerRef.current.clientHeight,
        forceOrientation,
        enableSmartTextFit: true
      }
    );

    return () => {
      if (responsiveCleanupRef.current) {
        responsiveCleanupRef.current();
        responsiveCleanupRef.current = null;
      }
    };
  }, [template, forceOrientation, currentOrientation, onOrientationChange, isClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (responsiveCleanupRef.current) {
        responsiveCleanupRef.current();
      }
    };
  }, []);

  // Toggle orientation (if enabled)
  const toggleOrientation = useCallback(() => {
    if (!enableOrientationToggle) return;
    
    const newOrientation = currentOrientation === 'landscape' ? 'portrait' : 'landscape';
    
    // Force the new orientation
    if (contentRef.current && containerRef.current) {
      const result = applyResponsiveScaling(contentRef.current, {
        viewportWidth: containerRef.current.clientWidth,
        viewportHeight: containerRef.current.clientHeight,
        forceOrientation: newOrientation,
        enableSmartTextFit: true
      });
      
      if (result.dimensions) {
        setDimensions(result.dimensions);
        setCurrentOrientation(newOrientation);
        
        if (onOrientationChange) {
          onOrientationChange(newOrientation);
        }
      }
    }
  }, [currentOrientation, enableOrientationToggle, onOrientationChange]);

  if (!template || !isClient) {
    return (
      <div className={`responsive-display-container ${className || ''}`}>
        <div className="center-content">
          <div>Loading template...</div>
        </div>
      </div>
    );
  }

  // Determine which template state to use
  let templateToRender = template;
  if (template.activeState && template.restingState) {
    // Use active state if we have runner data, otherwise resting state
    templateToRender = data ? template.activeState : template.restingState;
  }

  const processedHtml = substituteVariables(templateToRender.html || '', data);
  const templateCss = templateToRender.css || '';
  
  return (
    <div 
      ref={containerRef}
      className={`responsive-display-container ${className || ''}`}
      style={{
        backgroundColor: templateToRender.backgroundStyles?.backgroundColor || 'transparent'
      }}
    >
      <div 
        ref={contentRef}
        className="responsive-display-content"
      >
        <div className="layout-root">
          <style>{templateCss}</style>
          <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
        </div>
      </div>
      
      {/* Orientation toggle button (if enabled) */}
      {enableOrientationToggle && (
        <button 
          onClick={toggleOrientation}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 9999,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title={`Switch to ${currentOrientation === 'landscape' ? 'portrait' : 'landscape'} mode`}
        >
          {currentOrientation === 'landscape' ? '↻ Portrait' : '↻ Landscape'}
        </button>
      )}
      
      {/* Debug info */}
      {DEBUG_LOGGING && dimensions && (
        <div className="responsive-debug">
          <div>Orientation: {currentOrientation}</div>
          <div>Scale: {dimensions.scale.toFixed(3)}</div>
          <div>Size: {Math.round(dimensions.width)} × {Math.round(dimensions.height)}</div>
          <div>Offset: {Math.round(dimensions.offsetX)}, {Math.round(dimensions.offsetY)}</div>
        </div>
      )}
    </div>
  );
}