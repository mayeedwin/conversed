# Conversed Theme & Design System Tokens

Developers can theme the entire component tree by passing a single `primaryColor` prop or full `theme` object. Every block is styled from `--conversed-*` CSS variables, so overriding one token restyles all blocks at once.

---

## 1. React: import the stylesheet (required)

Angular blocks ship their styles inside the components, so they work with zero setup. **React ships its CSS separately** — import it once at your app root, or the blocks render unstyled (no borders, padding, or sizing):

```tsx
import '@conversed/react/styles.css';
```

The stylesheet is fully driven by the `--conversed-*` variables below, so a `primaryColor`/`theme` prop (or your own `:root` overrides) still restyles everything after import.

---

## 2. Single-Line Primary Color

```tsx
// React
<ConversedBlock block={block} primaryColor="#0071e3" />
```

```html
<!-- Angular -->
<conversed-block [block]="block" primaryColor="#0071e3"></conversed-block>
```

---

## 3. CSS Custom Properties

Defaults are light-mode safe. Override any of them on `:root` (or any ancestor) to retheme:

```css
:root {
  --conversed-primary: #0071e3;         /* WCAG-AA safe as text */
  --conversed-text: inherit;
  --conversed-text-muted: #8e8e93;      /* gray-600 */
  --conversed-card-bg: transparent;
  --conversed-border-color: #e5e5ea;    /* gray-200 */
  --conversed-radius: 8px;
  --conversed-font-family: inherit;
}
```

The full `--conversed-gray-50` … `--conversed-gray-900` ramp (see below) is defined
alongside these. Two alpha tints are derived from the primary color automatically —
`--conversed-primary-alpha15` and `--conversed-primary-alpha30` — for subtle fills and
hover states; they update whenever `--conversed-primary` changes.

---

## 4. iOS Gray Scale (50 → 900)

Conversed ships an iOS-inspired neutral ramp mapped from Apple's systemGray scale. Each shade is exposed as a `--conversed-gray-*` CSS variable, and the whole ramp is exported from `@conversed/core` as `CONVERSED_GRAY` for use in TypeScript. **Gray-200 (`#e5e5ea`) is the default border shade.**

| Token | Hex | CSS variable | Typical use |
| :--- | :--- | :--- | :--- |
| 50  | `#f9f9fb` | `--conversed-gray-50`  | Faint fills |
| 100 | `#f2f2f7` | `--conversed-gray-100` | Table header surface |
| **200** | **`#e5e5ea`** | **`--conversed-gray-200`** | **Borders, dividers (default)** |
| 300 | `#d1d1d6` | `--conversed-gray-300` | Stronger hairlines |
| 400 | `#c7c7cc` | `--conversed-gray-400` | Disabled borders |
| 500 | `#aeaeb2` | `--conversed-gray-500` | Placeholder text |
| 600 | `#8e8e93` | `--conversed-gray-600` | Muted / secondary text |
| 700 | `#636366` | `--conversed-gray-700` | Body text (on light) |
| 800 | `#48484a` | `--conversed-gray-800` | Headings |
| 900 | `#1c1c1e` | `--conversed-gray-900` | Code block surface |

Because borders resolve to `--conversed-border-color`, retint every block by pointing it at another shade:

```css
.my-chat { --conversed-border-color: var(--conversed-gray-300); }
```

Or reference the ramp directly in TypeScript:

```ts
import { CONVERSED_GRAY } from '@conversed/core';

const hairline = CONVERSED_GRAY[200]; // "#e5e5ea"
```

---

## 5. Full Theme Object

Pass a `theme` object to override multiple tokens at once (takes precedence over `primaryColor`). Every field maps to a `ConversedThemeTokens` property:

```tsx
<ConversedBlock
  block={block}
  theme={{
    primaryColor: '#10b981',    // custom brand color
    textColor: 'inherit',
    textMutedColor: '#8e8e93',  // gray-600
    cardBg: '#ffffff',
    borderColor: '#d1d1d6',     // gray-300
    borderRadius: '10px',
    fontFamily: 'inherit'
  }}
/>
```

Generate the resolved CSS from a theme (or the defaults) with
`generateCssVariables(theme?)` from `@conversed/core`.

---

## 6. Chart Colors

Chart blocks derive their series colors from `--conversed-primary` plus the
`CHART_SERIES_COLORS` palette, so charts pick up your brand color automatically. Set a
`primaryColor` (or override `--conversed-primary`) and the first series follows it;
additional series cycle through `CHART_SERIES_COLORS`. Charts render via Chart.js, which
is bundled — build a Chart.js config directly with `toChartJsConfig(block, { primaryColor })`.

---

## 7. Debug Logging (dev-facing)

Both the parser and the render components can log what they see to the console while you
develop. Both are silent by default:

```tsx
// Parser: logs the raw text + the parsed blocks (styled)
const blocks = parseMessageBlocks(rawAiResponse, { debug: true });

// Component: logs the blocks it renders
<ConversedContent blocks={blocks} debug />
```

```html
<!-- Angular -->
<conversed-content [blocks]="blocks()" [debug]="true"></conversed-content>
```
