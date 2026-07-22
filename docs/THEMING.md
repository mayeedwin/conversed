# Conversed Theme & Design System Tokens

Developers can theme the entire component tree by passing a single `primaryColor` prop or full `theme` object.

---

## 1. Single-Line Primary Color

```tsx
// React
<ConversedBlock block={block} primaryColor="#10b981" />
```

```html
<!-- Angular -->
<conversed-block [block]="block" primaryColor="#10b981"></conversed-block>
```

---

## 2. CSS Custom Properties

```css
:root {
  --conversed-primary: #6366f1;
  --conversed-card-bg: rgba(255, 255, 255, 0.04);
  --conversed-border-color: rgba(255, 255, 255, 0.1);
  --conversed-radius: 12px;
  --conversed-font-family: 'Inter', sans-serif;
}
```
