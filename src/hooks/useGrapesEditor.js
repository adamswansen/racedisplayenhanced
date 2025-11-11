/* ──────────────────────────────────────────────────────────────
   useGrapesEditor.js - Responsive GrapesJS Hook
   ------------------------------------------------------------------
   React hook for GrapesJS editor with responsive functionality and
   precise positioning system. This is a standalone version without
   race-specific dependencies.
   ------------------------------------------------------------------ */

import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs from 'grapesjs';
import { enhanceEditorWithResponsive } from '../utils/responsiveGrapesIntegration';

/**
 * Calculate the position where a new block should be placed on the canvas
 * @param {Object} editor - GrapesJS editor instance
 * @param {number} targetWidth - Canvas width
 * @param {number} targetHeight - Canvas height
 * @param {Event|null} event - Mouse event for precise positioning (optional)
 * @returns {Object} Position object with x, y coordinates
 */
const DEFAULT_COMPONENT_WIDTH = 100;
const DEFAULT_COMPONENT_HEIGHT = 50;

const getCanvasZoom = (editor) => {
  try {
    const zoom = editor?.Canvas?.getZoom?.();
    if (typeof zoom === 'number' && zoom > 0) {
      return zoom / 100;
    }
  } catch (error) {
    console.warn('[useGrapesEditor] Failed to read canvas zoom', error);
  }

  return 1;
};

const calculateBlockPosition = (editor, targetWidth, targetHeight, event = null) => {
  // If we have mouse event coordinates, use them for precise placement
  if (event) {
    const canvasIframe = editor.Canvas.getFrameEl();
    const canvasDoc = editor.Canvas.getDocument();

    if (canvasIframe && canvasDoc) {
      // Get iframe bounds relative to viewport
      const iframeRect = canvasIframe.getBoundingClientRect();

      // Calculate mouse position relative to iframe
      const mouseX = event.clientX - iframeRect.left;
      const mouseY = event.clientY - iframeRect.top;

      // Account for iframe scroll if any
      const scrollLeft = canvasDoc.documentElement.scrollLeft || canvasDoc.body.scrollLeft || 0;
      const scrollTop = canvasDoc.documentElement.scrollTop || canvasDoc.body.scrollTop || 0;

      const zoom = getCanvasZoom(editor);

      // Calculate final position (subtract half element size for centering on cursor)
      const x = Math.max(0, (mouseX + scrollLeft) / zoom - DEFAULT_COMPONENT_WIDTH / 2);
      const y = Math.max(0, (mouseY + scrollTop) / zoom - DEFAULT_COMPONENT_HEIGHT / 2);

      console.log('🎯 Precise positioning:', {
        mouseX,
        mouseY,
        scrollLeft,
        scrollTop,
        finalX: x, finalY: y,
        iframeRect,
        zoom
      });

      return { x, y };
    }
  }

  // Fallback: use stored drop coordinates if available
  if (editor && editor.__lastDropCoordinates) {
    const coords = editor.__lastDropCoordinates;
    console.log('🎯 Using stored drop coordinates:', coords);
    // Clear after use so we don't reuse stale data
    editor.__lastDropCoordinates = null;
    return coords;
  }

  // Final fallback: center placement with slight offset for multiple elements
  const wrapper = editor.getWrapper();
  const existingComponents = wrapper.components();
  
  // Center placement
  let x = Math.floor(targetWidth / 2) - DEFAULT_COMPONENT_WIDTH / 2;
  let y = Math.floor(targetHeight / 2) - DEFAULT_COMPONENT_HEIGHT / 2;
  
  // Small offset for multiple components to avoid exact overlap
  if (existingComponents.length > 0) {
    const offset = (existingComponents.length % 10) * 20;
    x += offset;
    y += offset;
  }
  
  return { x, y };
};

const initializeCanvasScaling = (editor, {
  targetWidth,
  targetHeight,
  containerSelector
}) => {
  const containerEl = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!containerEl) {
    console.warn('[useGrapesEditor] Unable to find editor container for scaling');
    return () => {};
  }

  const canvasWrapper = containerEl.querySelector('.gjs-cv-canvas');
  let resizeObserver = null;
  let resizeTimeout = null;
  let lastZoom = null;

  const applyZoom = () => {
    if (!containerEl) return;

    const availableWidth = containerEl.clientWidth;
    const availableHeight = containerEl.clientHeight;

    if (!availableWidth || !availableHeight) return;

    const scaleWidth = availableWidth / targetWidth;
    const scaleHeight = availableHeight / targetHeight;
    const scale = Math.min(Math.max(Math.min(scaleWidth, scaleHeight), 0.1), 1);
    const zoomValue = scale * 100;

    if (lastZoom === null || Math.abs(zoomValue - lastZoom) > 0.5) {
      editor.Canvas.setZoom(zoomValue);
      lastZoom = zoomValue;
      console.log('[useGrapesEditor] Applied canvas zoom', { scale, zoomValue });
    }
  };

  const scheduleZoom = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyZoom, 120);
  };

  // Ensure the canvas wrapper centers the scaled iframe
  if (canvasWrapper) {
    canvasWrapper.style.display = 'flex';
    canvasWrapper.style.alignItems = 'center';
    canvasWrapper.style.justifyContent = 'center';
  }

  applyZoom();

  // Observe size changes on the container
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(scheduleZoom);
    resizeObserver.observe(containerEl);
  }

  window.addEventListener('resize', scheduleZoom);
  editor.on('canvas:resize', scheduleZoom);

  return () => {
    clearTimeout(resizeTimeout);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener('resize', scheduleZoom);
    editor.off('canvas:resize', scheduleZoom);
    lastZoom = null;
  };
};

/**
 * Enhanced GrapesJS hook with responsive features and precise positioning
 * @param {Object} options - Configuration options
 * @param {number} options.targetWidth - Canvas width (default: 1920)
 * @param {number} options.targetHeight - Canvas height (default: 1080)  
 * @param {string} options.container - Container selector (default: '#grapesjs-editor')
 * @returns {Object} Editor ref and utilities
 */
export function useGrapesEditor({
  targetWidth = 1920,
  targetHeight = 1080,
  container = '#grapesjs-editor'
} = {}) {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const cleanupRef = useRef({ isMounted: true });

  useEffect(() => {
    // Prevent re-initialization
    if (editorRef.current) {
      console.log('[useGrapesEditor] Editor already initialized');
      return;
    }

    const cleanup = cleanupRef.current;
    cleanup.isMounted = true;

    // Basic GrapesJS configuration
    const editorConfig = {
      container,
      height: '100%',
      width: 'auto',
      
      // Precise positioning configuration
      dragMode: 'absolute',
      
      // Canvas configuration for responsive support
      canvas: {
        styles: ['/src/styles/responsiveDisplay.css'],
        showRulers: false,
        showGuides: false,
        snapToGrid: false,
        gridSnap: false
      },
      
      // Block manager configuration
      blockManager: {
        appendTo: '.blocks-container',
        dragMode: 'absolute'
      },
      
      // Style manager configuration
      styleManager: {
        appendTo: '.styles-container'
      },
      
      // Default component configuration
      defaultComponent: {
        draggable: true,
        resizable: true,
        style: {
          position: 'absolute'
        }
      },
      
      // Storage manager (disable for standalone use)
      storageManager: false
    };

    /* ────────── Initialize GrapesJS ────────── */
    console.log('[useGrapesEditor] Initializing GrapesJS editor');
    const editor = grapesjs.init(editorConfig);
    editorRef.current = editor;
    editor.__lastDropCoordinates = null;

    // Enhance editor with responsive functionality
    if (!editor._responsiveEnhanced) {
      enhanceEditorWithResponsive(editor, {
        enableAutoConversion: true,    // Auto-convert existing components
        enableResponsiveBlocks: true,  // Add responsive block options  
        enableResponsiveCommands: true, // Add conversion commands
        enableResponsiveStyles: true   // Enhance style manager
      });
      
      editor._responsiveEnhanced = true;
      console.log('✅ Editor enhanced with responsive features');
    }

    /**
     * Set up canvas drop zone for precise drag and drop positioning
     */
    const setupCanvasDropZone = () => {
      const canvas = editor.Canvas;
      const canvasEl = canvas.getFrameEl();

      if (!canvasEl) {
        return () => {};
      }

      console.log('🎯 Setting up canvas drop zone');

      const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      };

      const handleDragEnter = (e) => {
        e.preventDefault();
      };

      const handleDrop = (e) => {
        e.preventDefault();

        const zoom = getCanvasZoom(editor);
        const offsetX = typeof e.offsetX === 'number' ? e.offsetX : 0;
        const offsetY = typeof e.offsetY === 'number' ? e.offsetY : 0;

        const x = offsetX / zoom;
        const y = offsetY / zoom;

        console.log('🎯 Canvas drop detected at:', {
          clientX: e.clientX,
          clientY: e.clientY,
          offsetX,
          offsetY,
          zoom,
          adjustedX: x,
          adjustedY: y
        });

        // Store coordinates for calculateBlockPosition and component positioning
        editor.__lastDropCoordinates = {
          x,
          y,
          zoom
        };
      };

      canvasEl.addEventListener('dragover', handleDragOver);
      canvasEl.addEventListener('dragenter', handleDragEnter);
      canvasEl.addEventListener('drop', handleDrop);

      return () => {
        canvasEl.removeEventListener('dragover', handleDragOver);
        canvasEl.removeEventListener('dragenter', handleDragEnter);
        canvasEl.removeEventListener('drop', handleDrop);
      };
    };

    // Set up canvas when ready
    let dropZoneCleanup = () => {};
    let scalingCleanup = () => {};
    let handleComponentAdd = null;

    editor.on('load', () => {
      console.log('[useGrapesEditor] Editor loaded');

      // Set canvas dimensions
      const wrapper = editor.getWrapper();
      if (wrapper) {
        wrapper.addStyle({
          width: `${targetWidth}px`,
          height: `${targetHeight}px`
        });
      }

      dropZoneCleanup = setupCanvasDropZone();
      scalingCleanup = initializeCanvasScaling(editor, {
        targetWidth,
        targetHeight,
        containerSelector: container
      });

      const editorWrapper = editor.getWrapper();
      handleComponentAdd = (component) => {
        if (!editorWrapper) {
          return;
        }

        const dropPosition = editor.__lastDropCoordinates;
        editor.__lastDropCoordinates = null;

        if (!dropPosition) {
          return;
        }

        if (component.parent() !== editorWrapper) {
          return;
        }

        const { x, y } = dropPosition;
        const style = component.getStyle();
        const hasExplicitPosition =
          style.left !== undefined ||
          style.right !== undefined ||
          style.top !== undefined ||
          style.bottom !== undefined;

        if (!hasExplicitPosition) {
          component.addStyle({
            position: 'absolute',
            left: `${Math.round(x)}px`,
            top: `${Math.round(y)}px`
          });
        }
      };

      editor.on('component:add', handleComponentAdd);
      setIsReady(true);
    });

    // Handle component drag end to prevent repositioning
    const handleComponentDragEnd = (component) => {
      console.log('🎯 Component drag ended, preserving position');
      // Component should maintain its position - no additional snapping
    };

    editor.on('component:drag:end', handleComponentDragEnd);

    // Cleanup function
    cleanup.cleanup = () => {
      dropZoneCleanup();
      scalingCleanup();
      if (handleComponentAdd) {
        editorRef.current?.off('component:add', handleComponentAdd);
      }
      editorRef.current?.off('component:drag:end', handleComponentDragEnd);

      if (editorRef.current) {
        console.log('[useGrapesEditor] Cleaning up editor');
        editorRef.current.destroy();
        editorRef.current = null;
      }
      setIsReady(false);
    };

    return () => {
      if (cleanup.cleanup) {
        cleanup.cleanup();
      }
    };
  }, [targetWidth, targetHeight, container]);

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = cleanupRef.current;
    return () => {
      cleanup.isMounted = false;
      if (cleanup.cleanup) {
        cleanup.cleanup();
      }
    };
  }, []);

  return {
    editorRef,
    isReady,
    // Utility functions
    addTextBlock: useCallback((text, position) => {
      if (!editorRef.current) return;
      
      const pos = position || calculateBlockPosition(editorRef.current, targetWidth, targetHeight);
      
      editorRef.current.addComponents({
        type: 'text',
        content: text,
        style: {
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          'font-size': 'var(--font-md)',
          padding: '10px'
        }
      });
    }, [targetWidth, targetHeight]),
    
    addImageBlock: useCallback((src, position) => {
      if (!editorRef.current) return;
      
      const pos = position || calculateBlockPosition(editorRef.current, targetWidth, targetHeight);
      
      editorRef.current.addComponents({
        type: 'image',
        src,
        style: {
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          'max-width': '200px',
          'height': 'auto'
        }
      });
    }, [targetWidth, targetHeight])
  };
}

export default useGrapesEditor;