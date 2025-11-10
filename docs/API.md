# API Reference

## Core Utilities (`responsiveScaling.js`)

### `pixelsToViewport(pixels, unit, baseViewport)`
Converts pixel values to viewport-relative units with responsive constraints.

**Parameters:**
- `pixels` (number): Original pixel value
- `unit` (string): Target unit ('vw', 'vh', 'vmin', 'vmax')
- `baseViewport` (number): Base viewport size (default: 1920 for vw, 1080 for vh)

**Returns:** CSS clamp value string

**Example:**
```javascript
pixelsToViewport(24, 'vw') // Returns: "clamp(12px, 1.25vw, 48px)"
```

### `intelligentTextFit(element, options)`
Applies smart text fitting to ensure text fits within container bounds.

**Parameters:**
- `element` (HTMLElement): Text element to fit
- `options` (object): Configuration options
  - `maxReduction` (number): Maximum font reduction (default: 0.7)
  - `minFontSize` (number): Minimum font size in pixels (default: 12)
  - `preferWordWrap` (boolean): Try word wrapping first (default: true)
  - `step` (number): Reduction step size (default: 0.02)

**Returns:** Object with fitting information

**Example:**
```javascript
const result = intelligentTextFit(element, {
  maxReduction: 0.4,
  minFontSize: 10,
  preferWordWrap: true
});
// Returns: { method: 'word-wrap', fontSize: 24, reduction: 0, fits: true }
```

### `applyResponsiveScaling(container, options)`
Applies responsive scaling to a container and its children.

**Parameters:**
- `container` (HTMLElement): Container element
- `options` (object): Scaling options
  - `viewportWidth` (number): Current viewport width
  - `viewportHeight` (number): Current viewport height
  - `forceOrientation` (string): Force orientation ('landscape'|'portrait'|null)
  - `enableSmartTextFit` (boolean): Enable intelligent text fitting

**Returns:** Object with dimensions and properties

### `createResponsiveObserver(container, callback, options)`
Creates a resize observer for dynamic responsive updates.

**Parameters:**
- `container` (HTMLElement): Element to observe
- `callback` (function): Update callback function
- `options` (object): Observer configuration
  - `debounceMs` (number): Debounce delay (default: 150)

**Returns:** Cleanup function

## Components

### `RunnerDisplayEnhanced`
Enhanced display component with responsive scaling and intelligent text fitting.

**Props:**
- `runner` (object): Runner data object
- `template` (object): Template configuration
- `textFitOptions` (object): Text fitting configuration

**Example:**
```jsx
<RunnerDisplayEnhanced 
  runner={{
    first_name: 'John',
    last_name: 'Doe',
    bib: '123',
    time: '1:23:45'
  }}
  template={{
    html: '<div data-placeholder="first_name">{{first_name}}</div>',
    css: '.layout-root { background: blue; }'
  }}
  textFitOptions={{
    maxReduction: 0.4,
    preferWordWrap: true
  }}
/>
```

### `ResponsiveTemplateViewer`
Standalone template viewer with orientation controls.

**Props:**
- `html` (string): Template HTML
- `css` (string): Template CSS
- `data` (object): Template data for substitution
- `forceOrientation` (string): Force orientation ('landscape'|'portrait'|null)
- `enableOrientationToggle` (boolean): Show orientation toggle button
- `onOrientationChange` (function): Orientation change callback

**Example:**
```jsx
<ResponsiveTemplateViewer
  html="<div>{{name}}</div>"
  css="div { color: red; }"
  data={{ name: 'John Doe' }}
  forceOrientation="landscape"
  enableOrientationToggle={true}
  onOrientationChange={(orientation) => console.log(orientation)}
/>
```

### `useGrapesEditor`
Enhanced GrapesJS hook with responsive features and precise positioning.

**Parameters:**
- `options` (object):
  - `targetWidth` (number): Canvas width (default: 1920)
  - `targetHeight` (number): Canvas height (default: 1080)
  - `container` (string): Container selector (default: '#grapesjs-editor')

**Returns:**
- `editorRef` (ref): GrapesJS editor instance
- `isReady` (boolean): Editor ready state
- `addTextBlock` (function): Add text component
- `addImageBlock` (function): Add image component

**Example:**
```jsx
function TemplateBuilder() {
  const { editorRef, isReady, addTextBlock } = useGrapesEditor({
    targetWidth: 1920,
    targetHeight: 1080
  });

  return (
    <div>
      <button onClick={() => addTextBlock('Hello World')}>Add Text</button>
      <div id="grapesjs-editor" />
    </div>
  );
}
```

## CSS Variables

### Typography Scale
```css
--font-xs: clamp(12px, 1.5vw, 18px)
--font-sm: clamp(14px, 2vw, 24px)
--font-md: clamp(18px, 3vw, 36px)
--font-lg: clamp(24px, 4vw, 48px)
--font-xl: clamp(32px, 5vw, 64px)
--font-xxl: clamp(40px, 6vw, 80px)
```

### Spacing Scale
```css
--spacing-1: clamp(4px, 0.4vmin, 8px)
--spacing-2: clamp(8px, 0.8vmin, 16px)
--spacing-3: clamp(12px, 1.2vmin, 24px)
--spacing-4: clamp(16px, 1.6vmin, 32px)
--spacing-5: clamp(20px, 2vmin, 40px)
```

## Data Attributes

### Text Fitting Control
Control text fitting behavior with data attributes:

```html
<!-- Auto fitting (recommended) -->
<div data-text-fit="auto" data-max-reduction="40">Text content</div>

<!-- Font shrinking only -->
<div data-text-fit="shrink" data-min-font-size="12">Text content</div>

<!-- Word wrapping only -->
<div data-text-fit="wrap">Text content</div>

<!-- Text truncation with ellipsis -->
<div data-text-fit="ellipsis">Text content</div>

<!-- No fitting -->
<div data-text-fit="none">Text content</div>
```

### Available Attributes
- `data-text-fit`: Fitting strategy ('auto'|'shrink'|'wrap'|'ellipsis'|'none')
- `data-min-font-size`: Minimum font size in pixels (default: 12)
- `data-max-reduction`: Maximum font reduction percentage (default: 30)
- `data-placeholder`: Identifies template placeholder elements

## Integration Functions

### `enhanceEditorWithResponsive(editor, options)`
Enhance existing GrapesJS editor with responsive functionality.

**Parameters:**
- `editor` (object): GrapesJS editor instance
- `options` (object): Enhancement options
  - `enableAutoConversion` (boolean): Auto-convert components (default: true)
  - `enableResponsiveBlocks` (boolean): Add responsive blocks (default: true)
  - `enableResponsiveCommands` (boolean): Add commands (default: true)
  - `enableResponsiveStyles` (boolean): Enhance style manager (default: true)

### `getResponsiveStatus(editor)`
Get responsive enhancement status of editor components.

**Returns:** Object with statistics:
- `totalComponents`: Total component count
- `responsiveComponents`: Components using responsive units
- `responsivePercentage`: Percentage of responsive components
- `textResponsivePercentage`: Percentage of responsive text components