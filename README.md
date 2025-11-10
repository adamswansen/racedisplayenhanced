# Responsive Race Display System

A comprehensive, production-ready responsive display system for race timing applications built with React and GrapesJS.

## 🌟 Features

### 🎯 **Responsive Design**
- **Viewport-relative scaling**: Uses `clamp()` functions and viewport units for perfect scaling
- **Orientation support**: Automatic landscape/portrait mode handling
- **Breakpoint optimization**: Mobile, tablet, desktop, and large screen optimizations
- **Intelligent text fitting**: Handles long names with word wrapping and font reduction

### 📐 **Precise Positioning**
- **Drag-and-drop accuracy**: Elements stay exactly where you place them
- **No unwanted snapping**: Disabled grid snapping for precise control
- **Mouse coordinate tracking**: Real-time positioning based on cursor location
- **Canvas drop zones**: Enhanced HTML5 drag-and-drop support

### 🎨 **Template Builder**
- **Enhanced GrapesJS editor**: Responsive-aware template creation
- **Smart component conversion**: Auto-converts pixel values to responsive units
- **Text optimization commands**: One-click responsive text conversion
- **Orientation preview**: Test templates in different orientations

### 🏃 **Race Display Components**
- **Runner data integration**: Dynamic placeholder substitution
- **Animation support**: Animate.css integration with custom timing
- **Template state management**: Active/resting state handling
- **Real-time updates**: WebSocket support for live data

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/responsive-race-display.git
cd responsive-race-display

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Quick Start

### 1. Basic Display Component

```jsx
import React from 'react';
import RunnerDisplayEnhanced from './components/RunnerDisplayEnhanced';

function RaceDisplay({ runner, template }) {
  return (
    <RunnerDisplayEnhanced 
      runner={runner} 
      template={template}
    />
  );
}
```

### 2. Template Viewer with Orientation Control

```jsx
import ResponsiveTemplateViewer from './components/ResponsiveTemplateViewer';

function TemplatePreview() {
  return (
    <ResponsiveTemplateViewer 
      forceOrientation="landscape"
      enableOrientationToggle={true}
      onOrientationChange={(orientation) => {
        console.log('Switched to:', orientation);
      }}
    />
  );
}
```

### 3. Enhanced Template Builder

```jsx
import { useGrapesEditor } from './hooks/useGrapesEditor';
import './styles/responsiveDisplay.css';

function TemplateBuilder() {
  const { editorRef } = useGrapesEditor({
    targetWidth: 1920,
    targetHeight: 1080
  });

  return (
    <div id="grapesjs-editor" />
  );
}
```

## 📐 Core Components

### `responsiveScaling.js`
Core utilities for viewport calculations and intelligent text fitting:
- `pixelsToViewport()` - Convert pixels to responsive units
- `intelligentTextFit()` - Smart text sizing with word wrap fallbacks
- `applyResponsiveScaling()` - Apply responsive scaling to containers
- `createResponsiveObserver()` - Dynamic viewport change handling

### `RunnerDisplayEnhanced.jsx`
Enhanced display component with responsive features:
- Smart text fitting based on element attributes
- Template preprocessing with responsive awareness
- Animation support with Animate.css integration
- Error boundaries and loading states

### `ResponsiveTemplateViewer.jsx`
Standalone template viewer with orientation support:
- Automatic orientation detection
- Manual orientation switching
- Variable substitution for preview data
- Client-side rendering safety

### `useGrapesEditor.js`
Enhanced GrapesJS hook with positioning system:
- Precise drag-and-drop positioning
- Responsive feature integration
- Canvas drop zone setup
- Anti-snapping configuration

## 🎨 CSS Architecture

### Responsive Variables
```css
:root {
  --font-xs: clamp(12px, 1.5vw, 18px);
  --font-sm: clamp(14px, 2vw, 24px);
  --font-md: clamp(18px, 3vw, 36px);
  --font-lg: clamp(24px, 4vw, 48px);
  --font-xl: clamp(32px, 5vw, 64px);
  --font-xxl: clamp(40px, 6vw, 80px);
}
```

### Text Fitting Classes
```css
.text-fit-shrink { /* Font reduction strategy */ }
.text-fit-wrap { /* Word wrapping strategy */ }
.text-fit-ellipsis { /* Text truncation strategy */ }
```

### Orientation Support
```css
@media (orientation: portrait) {
  /* Portrait-optimized typography */
}

@media (orientation: landscape) {
  /* Landscape-optimized typography */
}
```

## 🔧 Configuration

### Text Fitting Options
Configure intelligent text fitting behavior:

```jsx
<RunnerDisplayEnhanced 
  runner={runner} 
  template={template}
  textFitOptions={{
    maxReduction: 0.4,      // Allow up to 40% font reduction
    minFontSize: 10,        // Never go below 10px
    preferWordWrap: true,   // Try word wrapping first
    step: 0.02             // 2% reduction steps
  }}
/>
```

### Element Attributes
Control text fitting per element:

```html
<div 
  data-placeholder="last_name"
  data-text-fit="auto"
  data-min-font-size="12"
  data-max-reduction="30"
>
  {{last_name}}
</div>
```

### GrapesJS Integration
Enhance existing editors:

```javascript
import { enhanceEditorWithResponsive } from './utils/responsiveGrapesIntegration';

enhanceEditorWithResponsive(editor, {
  enableAutoConversion: true,    // Convert existing components
  enableResponsiveBlocks: true,  // Add responsive blocks
  enableResponsiveCommands: true, // Add editor commands
  enableResponsiveStyles: true   // Enhance style manager
});
```

## 📱 Device Support

- **Mobile**: 320px - 768px (Portrait optimized)
- **Tablet**: 768px - 1024px (Landscape/Portrait)
- **Desktop**: 1024px - 1440px (Standard displays)
- **Large**: 1440px+ (High-resolution displays)

## 🎯 Text Fitting Strategies

### 1. Auto Mode (Recommended)
Intelligent combination of word wrapping and font reduction:
```html
<div data-text-fit="auto">Smart fitting</div>
```

### 2. Shrink Mode
Font reduction only:
```html
<div data-text-fit="shrink">Font reduction</div>
```

### 3. Wrap Mode
Word wrapping only:
```html
<div data-text-fit="wrap">Word wrapping</div>
```

### 4. Ellipsis Mode
Text truncation with ellipsis:
```html
<div data-text-fit="ellipsis">Truncated text...</div>
```

## 🚀 Performance

- **Debounced updates**: 150ms debounce for resize events
- **Efficient observers**: Single observer per container
- **CSS-first approach**: Leverage native CSS performance
- **Minimal re-renders**: Optimized React component updates

## 🛠️ Development

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint checking
```

### Debug Mode
Enable detailed logging:
```javascript
// Set DEBUG_LOGGING = true in components
const DEBUG_LOGGING = true;
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/responsive-race-display/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/responsive-race-display/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/responsive-race-display/wiki)

---

Made with ❤️ for the race timing community