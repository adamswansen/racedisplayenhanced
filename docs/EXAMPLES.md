# Examples

## Basic Usage

### Simple Runner Display

```jsx
import React from 'react';
import { RunnerDisplayEnhanced } from 'responsive-race-display';

function SimpleDisplay() {
  const runner = {
    first_name: 'John',
    last_name: 'Smith',
    bib: '42',
    time: '1:23:45'
  };

  const template = {
    html: `
      <div style="position: relative; width: 100%; height: 100%; background: #1e3a8a;">
        <div data-placeholder="first_name" style="position: absolute; left: 20px; top: 20px; color: white; font-size: 48px;">{{first_name}}</div>
        <div data-placeholder="last_name" style="position: absolute; left: 20px; top: 80px; color: white; font-size: 36px;" data-text-fit="auto">{{last_name}}</div>
        <div data-placeholder="bib" style="position: absolute; right: 20px; top: 20px; color: white; font-size: 64px;">{{bib}}</div>
        <div data-placeholder="time" style="position: absolute; left: 20px; bottom: 20px; color: white; font-size: 48px;">{{time}}</div>
      </div>
    `
  };

  return <RunnerDisplayEnhanced runner={runner} template={template} />;
}
```

### Template Viewer with Controls

```jsx
import React, { useState } from 'react';
import { ResponsiveTemplateViewer } from 'responsive-race-display';

function TemplatePreview() {
  const [orientation, setOrientation] = useState('landscape');
  const [runner, setRunner] = useState({
    first_name: 'Jane',
    last_name: 'Doe-Henderson-Williams',
    bib: '100'
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Orientation:
          <select value={orientation} onChange={e => setOrientation(e.target.value)}>
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      </div>
      
      <ResponsiveTemplateViewer
        html={`
          <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); height: 100%;">
            <h1 data-placeholder="first_name" style="padding: 20px; color: white;">{{first_name}}</h1>
            <h2 data-placeholder="last_name" style="padding: 0 20px; color: white;" data-text-fit="auto">{{last_name}}</h2>
            <div data-placeholder="bib" style="position: absolute; top: 20px; right: 20px; font-size: 48px; color: white;">{{bib}}</div>
          </div>
        `}
        data={runner}
        forceOrientation={orientation === 'auto' ? null : orientation}
        enableOrientationToggle={true}
        onOrientationChange={newOrientation => {
          console.log('Orientation changed:', newOrientation);
        }}
      />
    </div>
  );
}
```

## Advanced Usage

### Custom Template Builder

```jsx
import React, { useEffect, useState } from 'react';
import { useGrapesEditor, enhanceEditorWithResponsive } from 'responsive-race-display';

function AdvancedTemplateBuilder() {
  const { editorRef, isReady } = useGrapesEditor({
    targetWidth: 1920,
    targetHeight: 1080,
    container: '#my-editor'
  });

  const [template, setTemplate] = useState(null);

  // Get template data when ready
  useEffect(() => {
    if (isReady && editorRef.current) {
      const editor = editorRef.current;
      
      // Listen for changes
      editor.on('component:update', () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        setTemplate({ html, css });
      });
    }
  }, [isReady]);

  const addResponsiveText = () => {
    if (editorRef.current) {
      editorRef.current.addComponents({
        type: 'text',
        content: 'Responsive Text',
        style: {
          'font-size': 'var(--font-lg)',
          'position': 'absolute',
          'left': '50px',
          'top': '50px',
          'color': '#333'
        },
        attributes: {
          'data-text-fit': 'auto',
          'data-max-reduction': '40'
        }
      });
    }
  };

  const convertToResponsive = () => {
    if (editorRef.current) {
      editorRef.current.runCommand('convert-to-responsive');
    }
  };

  const optimizeText = () => {
    if (editorRef.current) {
      editorRef.current.runCommand('optimize-text-sizing');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#f5f5f5' }}>
        <button onClick={addResponsiveText}>Add Responsive Text</button>
        <button onClick={convertToResponsive}>Convert Selected to Responsive</button>
        <button onClick={optimizeText}>Optimize All Text</button>
      </div>
      
      <div style={{ flex: 1, display: 'flex' }}>
        <div id="my-editor" style={{ flex: 1 }} />
        
        {template && (
          <div style={{ width: '300px', padding: '10px', background: '#f9f9f9' }}>
            <h4>Generated Template</h4>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(template, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Text Fitting Strategies

```jsx
import React from 'react';
import { ResponsiveTemplateViewer } from 'responsive-race-display';

function TextFittingDemo() {
  const longNameRunner = {
    name: 'Alexander Bartholomew Christianson-Davidson-Emerson'
  };

  const strategies = [
    {
      title: 'Auto Fitting (Recommended)',
      template: `
        <div data-placeholder="name" 
             data-text-fit="auto" 
             data-max-reduction="40"
             style="width: 300px; height: 60px; border: 2px solid #333; padding: 10px; font-size: 24px;">
          {{name}}
        </div>
      `
    },
    {
      title: 'Shrink Only',
      template: `
        <div data-placeholder="name" 
             data-text-fit="shrink" 
             data-min-font-size="14"
             style="width: 300px; height: 60px; border: 2px solid #333; padding: 10px; font-size: 24px;">
          {{name}}
        </div>
      `
    },
    {
      title: 'Word Wrap Only',
      template: `
        <div data-placeholder="name" 
             data-text-fit="wrap"
             style="width: 300px; height: 60px; border: 2px solid #333; padding: 10px; font-size: 18px;">
          {{name}}
        </div>
      `
    },
    {
      title: 'Ellipsis Truncation',
      template: `
        <div data-placeholder="name" 
             data-text-fit="ellipsis"
             style="width: 300px; height: 60px; border: 2px solid #333; padding: 10px; font-size: 18px; line-height: 40px;">
          {{name}}
        </div>
      `
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Text Fitting Strategies</h2>
      <p>Testing with long name: {longNameRunner.name}</p>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {strategies.map((strategy, index) => (
          <div key={index}>
            <h3>{strategy.title}</h3>
            <div style={{ border: '1px solid #ddd', padding: '20px' }}>
              <ResponsiveTemplateViewer
                html={strategy.template}
                data={longNameRunner}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Responsive Layout Patterns

```jsx
import React from 'react';
import { ResponsiveTemplateViewer } from 'responsive-race-display';

function LayoutPatterns() {
  const runner = {
    first_name: 'John',
    last_name: 'Smith-Johnson',
    bib: '42',
    time: '1:23:45',
    pace: '6:30'
  };

  const patterns = [
    {
      name: 'Header Layout',
      html: `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-4); background: linear-gradient(90deg, #1e40af, #3b82f6);">
          <div>
            <div data-placeholder="first_name" style="font-size: var(--font-xl); color: white; font-weight: bold;">{{first_name}}</div>
            <div data-placeholder="last_name" style="font-size: var(--font-lg); color: white;" data-text-fit="auto">{{last_name}}</div>
          </div>
          <div data-placeholder="bib" style="font-size: var(--font-xxl); color: white; font-weight: bold;">{{bib}}</div>
        </div>
      `
    },
    {
      name: 'Card Layout',
      html: `
        <div style="max-width: 400px; margin: var(--spacing-4) auto; padding: var(--spacing-6); background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: var(--spacing-4);">
            <div data-placeholder="bib" style="font-size: var(--font-xxl); color: #1e40af; font-weight: bold;">{{bib}}</div>
          </div>
          <div style="margin-bottom: var(--spacing-3);">
            <div data-placeholder="first_name" style="font-size: var(--font-lg); font-weight: bold; color: #1f2937;">{{first_name}}</div>
            <div data-placeholder="last_name" style="font-size: var(--font-md); color: #6b7280;" data-text-fit="auto">{{last_name}}</div>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="font-size: var(--font-sm); color: #6b7280;">Time</div>
              <div data-placeholder="time" style="font-size: var(--font-lg); font-weight: bold; color: #1f2937;">{{time}}</div>
            </div>
            <div>
              <div style="font-size: var(--font-sm); color: #6b7280;">Pace</div>
              <div data-placeholder="pace" style="font-size: var(--font-lg); font-weight: bold; color: #1f2937;">{{pace}}</div>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Split Layout',
      html: `
        <div style="display: flex; height: 100%; background: linear-gradient(45deg, #8b5cf6, #06b6d4);">
          <div style="flex: 1; padding: var(--spacing-6); display: flex; flex-direction: column; justify-content: center;">
            <div data-placeholder="first_name" style="font-size: var(--font-xxl); color: white; font-weight: bold; margin-bottom: var(--spacing-2);">{{first_name}}</div>
            <div data-placeholder="last_name" style="font-size: var(--font-xl); color: white;" data-text-fit="auto">{{last_name}}</div>
          </div>
          <div style="flex: 1; padding: var(--spacing-6); display: flex; flex-direction: column; justify-content: center; align-items: flex-end; text-align: right;">
            <div data-placeholder="bib" style="font-size: var(--font-xxl); color: white; font-weight: bold; margin-bottom: var(--spacing-2);">#{{bib}}</div>
            <div data-placeholder="time" style="font-size: var(--font-xl); color: white;">{{time}}</div>
          </div>
        </div>
      `
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Responsive Layout Patterns</h2>
      
      <div style={{ display: 'grid', gap: '40px', marginTop: '20px' }}>
        {patterns.map((pattern, index) => (
          <div key={index}>
            <h3>{pattern.name}</h3>
            <div style={{ 
              border: '2px solid #ddd', 
              borderRadius: '8px', 
              overflow: 'hidden',
              height: '300px'
            }}>
              <ResponsiveTemplateViewer
                html={pattern.html}
                data={runner}
                enableOrientationToggle={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Performance Optimization

```jsx
import React, { useMemo, useCallback } from 'react';
import { RunnerDisplayEnhanced, createResponsiveObserver } from 'responsive-race-display';

function OptimizedDisplay({ runners, template }) {
  // Memoize template processing
  const processedTemplate = useMemo(() => {
    if (!template) return null;
    
    // Pre-process template for better performance
    return {
      ...template,
      html: template.html.replace(/\s+/g, ' ').trim(),
      css: template.css.replace(/\s+/g, ' ').trim()
    };
  }, [template]);

  // Optimized text fitting options
  const textFitOptions = useMemo(() => ({
    maxReduction: 0.3,
    minFontSize: 12,
    preferWordWrap: true,
    step: 0.05 // Larger steps for better performance
  }), []);

  // Debounced update handler
  const handleUpdate = useCallback(
    debounce((result) => {
      console.log('Responsive update:', result);
    }, 200),
    []
  );

  return (
    <div>
      {runners.map(runner => (
        <div key={runner.id} style={{ marginBottom: '20px' }}>
          <RunnerDisplayEnhanced
            runner={runner}
            template={processedTemplate}
            textFitOptions={textFitOptions}
          />
        </div>
      ))}
    </div>
  );
}

// Simple debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

## Integration Examples

### With React Router

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResponsiveTemplateViewer } from 'responsive-race-display';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/display/:runnerId" 
          element={<DisplayPage />} 
        />
        <Route 
          path="/preview" 
          element={<PreviewPage />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

function DisplayPage() {
  const { runnerId } = useParams();
  // Fetch runner data...
  
  return <ResponsiveTemplateViewer data={runnerData} />;
}
```

### With State Management

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RunnerDisplayEnhanced } from 'responsive-race-display';

function ConnectedDisplay() {
  const { currentRunner, template } = useSelector(state => ({
    currentRunner: state.race.currentRunner,
    template: state.templates.active
  }));
  
  const dispatch = useDispatch();
  
  return (
    <RunnerDisplayEnhanced
      runner={currentRunner}
      template={template}
      onUpdate={(data) => {
        dispatch({ type: 'RUNNER_DISPLAY_UPDATE', payload: data });
      }}
    />
  );
}
```