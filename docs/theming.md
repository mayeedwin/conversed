# Conversed Theme & Design System Tokens

Every block is styled from `--conversed-*` CSS variables, so a single `primaryColor` prop (or `theme` object, or a `:root` override) restyles all blocks at once.

**React ships CSS separately** — import it once at your app root or blocks render unstyled:

```tsx
import '@conversed/react/styles.css';
```

Angular blocks ship styles inline (zero setup).

## Primary Color

```tsx
<ConversedBlock block={block} primaryColor="#0071e3" />          {/* React */}
```
```html
<conversed-block [block]="block" primaryColor="#0071e3"></conversed-block>  <!-- Angular -->
```

## CSS Custom Properties

Defaults are light-mode safe; override on `:root` (or any ancestor):

```css
:root {
  --conversed-primary: #0071e3;         /* WCAG-AA safe as text */
  --conversed-text: inherit;
  --conversed-text-muted: #8e8e93;
  --conversed-card-bg: transparent;
  --conversed-border-color: #e5e5ea;    /* gray-200, default border */
  --conversed-radius: 8px;
  --conversed-font-family: inherit;
}
```

Two alpha tints are derived from the primary automatically — `--conversed-primary-alpha15` and `--conversed-primary-alpha30` — updating whenever `--conversed-primary` changes.

## iOS Gray Scale (50 → 900)

Each shade is a `--conversed-gray-*` variable; the full ramp also exports from `@conversed/core` as `CONVERSED_GRAY`. **Gray-200 (`#e5e5ea`) is the default border shade.**

| Token | Hex | Typical use |
| :--- | :--- | :--- |
| 50  | `#f9f9fb` | Faint fills |
| 100 | `#f2f2f7` | Table header surface |
| **200** | **`#e5e5ea`** | **Borders, dividers (default)** |
| 300 | `#d1d1d6` | Stronger hairlines |
| 400 | `#c7c7cc` | Disabled borders |
| 500 | `#aeaeb2` | Placeholder text |
| 600 | `#8e8e93` | Muted / secondary text |
| 700 | `#636366` | Body text (on light) |
| 800 | `#48484a` | Headings |
| 900 | `#1c1c1e` | Code block surface |

```css
.my-chat { --conversed-border-color: var(--conversed-gray-300); }
```
```ts
import { CONVERSED_GRAY } from '@conversed/core';
const hairline = CONVERSED_GRAY[200]; // "#e5e5ea"
```

## Full Theme Object

Pass a `theme` object to override multiple `ConversedThemeTokens` at once (takes precedence over `primaryColor`):

```tsx
<ConversedBlock block={block} theme={{
  primaryColor: '#10b981',
  textColor: 'inherit',
  textMutedColor: '#8e8e93',
  cardBg: '#ffffff',
  borderColor: '#d1d1d6',
  borderRadius: '10px',
  fontFamily: 'inherit'
}} />
```

Generate resolved CSS from a theme (or defaults) with `generateCssVariables(theme?)`.

## Chart Colors

Chart series derive from `--conversed-primary` plus the `CHART_SERIES_COLORS` palette — the first series follows your brand color, others cycle the palette. Build a Chart.js config directly with `toChartJsConfig(block, { primaryColor })`.

## Debug Logging (dev)

Silent by default. Enable on the parser and/or the components:

```tsx
const blocks = parseMessageBlocks(rawAiResponse, { debug: true });
<ConversedContent blocks={blocks} debug />
```
```html
<conversed-content [blocks]="blocks()" [debug]="true"></conversed-content>
```
