import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RunnerDisplayEnhanced,
  ResponsiveTemplateViewer,
  useGrapesEditor
} from './index';

// Example runner data
const sampleRunner = {
  first_name: 'John',
  last_name: 'Doe-Smith-Johnson-Williams',
  bib: '12345',
  time: '1:23:45',
  pace: '7:30',
  custom_message: 'Great job!'
};

// Example template
const sampleTemplate = {
  html: `
    <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div data-placeholder="first_name" style="position: absolute; left: 50px; top: 50px; color: white; font-size: 48px; font-weight: bold;">{{first_name}}</div>
      <div data-placeholder="last_name" style="position: absolute; left: 50px; top: 120px; color: white; font-size: 36px;" data-text-fit="auto" data-max-reduction="40">{{last_name}}</div>
      <div data-placeholder="bib" style="position: absolute; right: 50px; top: 50px; color: white; font-size: 64px; font-weight: bold;">{{bib}}</div>
      <div data-placeholder="time" style="position: absolute; left: 50px; bottom: 100px; color: white; font-size: 48px; font-weight: bold;">{{time}}</div>
      <div data-placeholder="custom_message" style="position: absolute; right: 50px; bottom: 50px; color: white; font-size: 24px; font-style: italic;">{{custom_message}}</div>
    </div>
  `,
  css: `
    .layout-root {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `,
  canvasWidth: 1920,
  canvasHeight: 1080
};

// Template Builder Component
function TemplateBuilder() {
  const { editorRef, isReady, addTextBlock, addImageBlock } = useGrapesEditor({
    targetWidth: 1920,
    targetHeight: 1080,
    container: '#grapesjs-editor'
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h2>Responsive Template Builder</h2>
        <p>Status: {isReady ? '✅ Ready' : '⏳ Loading...'}</p>
        <button onClick={() => addTextBlock('Sample Text')}>Add Text</button>
        <button onClick={() => addImageBlock('/sample-image.jpg')}>Add Image</button>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: '200px', background: '#f9f9f9', padding: '10px' }}>
          <div className="blocks-container">
            <h4>Blocks</h4>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div id="grapesjs-editor"></div>
        </div>
        <div style={{ width: '300px', background: '#f9f9f9', padding: '10px' }}>
          <div className="styles-container">
            <h4>Styles</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Demo App
function DemoApp() {
  const [activeDemo, setActiveDemo] = useState('display');
  const [orientation, setOrientation] = useState('landscape');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ 
        padding: '20px', 
        background: '#333', 
        color: 'white',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <h1>Responsive Race Display Demo</h1>
        <button 
          onClick={() => setActiveDemo('display')}
          style={{ 
            padding: '10px 20px', 
            background: activeDemo === 'display' ? '#0066cc' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Runner Display
        </button>
        <button 
          onClick={() => setActiveDemo('viewer')}
          style={{ 
            padding: '10px 20px', 
            background: activeDemo === 'viewer' ? '#0066cc' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Template Viewer
        </button>
        <button 
          onClick={() => setActiveDemo('builder')}
          style={{ 
            padding: '10px 20px', 
            background: activeDemo === 'builder' ? '#0066cc' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Template Builder
        </button>
      </nav>

      {activeDemo === 'display' && (
        <div style={{ padding: '20px' }}>
          <h2>Enhanced Runner Display</h2>
          <p>Resize your browser window to see responsive scaling in action!</p>
          <div style={{ 
            border: '2px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            height: '60vh'
          }}>
            <RunnerDisplayEnhanced 
              runner={sampleRunner} 
              template={sampleTemplate}
            />
          </div>
        </div>
      )}

      {activeDemo === 'viewer' && (
        <div style={{ padding: '20px' }}>
          <h2>Responsive Template Viewer</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px' }}>Orientation:</label>
            <select 
              value={orientation} 
              onChange={(e) => setOrientation(e.target.value)}
              style={{ padding: '5px' }}
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div style={{ 
            border: '2px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            height: '60vh'
          }}>
            <ResponsiveTemplateViewer
              html={sampleTemplate.html}
              css={sampleTemplate.css}
              data={sampleRunner}
              forceOrientation={orientation === 'auto' ? null : orientation}
              enableOrientationToggle={true}
              onOrientationChange={(newOrientation) => {
                console.log('Orientation changed to:', newOrientation);
              }}
            />
          </div>
        </div>
      )}

      {activeDemo === 'builder' && (
        <div>
          <TemplateBuilder />
        </div>
      )}
    </div>
  );
}

// Initialize the demo
const container = document.getElementById('root');
if (!container) {
  document.body.innerHTML = '<div id="root"></div>';
}

const root = createRoot(document.getElementById('root'));
root.render(<DemoApp />);