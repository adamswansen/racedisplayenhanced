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
      
      // Calculate final position (subtract half element size for centering on cursor)
      const x = Math.max(0, mouseX + scrollLeft - 50);
      const y = Math.max(0, mouseY + scrollTop - 25);
      
      console.log('🎯 Precise positioning:', { 
        mouseX, mouseY, scrollLeft, scrollTop, 
        finalX: x, finalY: y, 
        iframeRect 
      });
      
      return { x, y };
    }
  }
  
  // Fallback: use stored drop coordinates if available
  if (window._lastDropCoordinates) {
    const coords = window._lastDropCoordinates;
    console.log('🎯 Using stored drop coordinates:', coords);
    // Clear after use
    delete window._lastDropCoordinates;
    return coords;
  }
  
  // Final fallback: center placement with slight offset for multiple elements
  const wrapper = editor.getWrapper();
  const existingComponents = wrapper.components();
  
  // Center placement
  let x = Math.floor(targetWidth / 2) - 50;
  let y = Math.floor(targetHeight / 2) - 25;
  
  // Small offset for multiple components to avoid exact overlap
  if (existingComponents.length > 0) {
    const offset = (existingComponents.length % 10) * 20;
    x += offset;
    y += offset;
  }
  
  return { x, y };
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
      
      if (canvasEl) {
        console.log('🎯 Setting up canvas drop zone');
        
        // Prevent default drag behaviors
        canvasEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        });
        
        canvasEl.addEventListener('dragenter', (e) => {
          e.preventDefault();
        });
        
        // Handle drop events
        canvasEl.addEventListener('drop', (e) => {
          e.preventDefault();
          
          console.log('🎯 Canvas drop detected at:', {
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.offsetX,
            offsetY: e.offsetY
          });
          
          // Store coordinates for calculateBlockPosition to use
          window._lastDropCoordinates = {
            x: e.offsetX || 0,
            y: e.offsetY || 0
          };
        });
      }
    };

    // Set up canvas when ready
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
      
      setupCanvasDropZone();
      setIsReady(true);
    });

    // Handle component drag end to prevent repositioning
    editor.on('component:drag:end', (component) => {
      console.log('🎯 Component drag ended, preserving position');
      // Component should maintain its position - no additional snapping
    });

    // Cleanup function
    cleanup.cleanup = () => {
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