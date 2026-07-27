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
  --conversed-card-bg: transparent;     /* flat/border-only by default */
  --conversed-surface: #f9f9fb;         /* fill used by the `filled` variant (light-safe; see Dark mode below) */
  --conversed-border-color: #e5e5ea;    /* gray-200, default border */
  --conversed-radius: 8px;
  --conversed-font-family: inherit;
  --conversed-success: #34c759;         /* CTA `done` status */
  --conversed-critical: #ff3b30;        /* CTA `failed` status */
}
```

Two alpha tints are derived from the primary automatically — `--conversed-primary-alpha15` and `--conversed-primary-alpha30` — updating whenever `--conversed-primary` changes.

## Surface Variant

Blocks are **flat** by default — transparent, border-only cards that sit cleanly inside your own chat bubble. Opt into filled surfaces with the `variant` prop, without picking a per-block color:

```tsx
// React
<ConversedContent blocks={blocks} variant="filled" />   {/* 'flat' (default) | 'filled' */}
```

```html
<!-- Angular -->
<conversed-content [blocks]="blocks()" variant="filled"></conversed-content>
```

`filled` sets each card-like block's background to `--conversed-surface`. When you don't set `surface`/`cardBg` in the theme, the stylesheet supplies a **light-safe default**; pass `surface` (or override `--conversed-surface`) to customize it. Explicitly setting `cardBg` always wins over the variant.

> Callouts render with a **tone-colored status dot** at the top-left (info/success/warning/critical/neutral) rather than a left border.

## Dark mode

The surface **does not follow the OS color scheme by default** — a component library should inherit *your app's* theme, not the machine's, so an app in light mode on a dark-OS device won't get dark surfaces it never asked for. To colour the surface, in order of precedence:

1. **Theme token** — set `surface` (or `--conversed-surface`) directly. Always wins.
2. **App-controlled dark** — set `data-conversed-color-scheme="dark"` on any ancestor (e.g. `<html>`) to track your app's own dark toggle, independent of the OS.
3. **OS-driven** — set `data-conversed-color-scheme="auto"` to opt back into the old `prefers-color-scheme` behavior.

```html
<!-- Follows your app's dark mode, not the OS -->
<html data-conversed-color-scheme="dark"> … </html>
```

The Angular renderer reads the attribute from ancestors via `:host-context()`, so the same markup works in both frameworks.

## List Style

List blocks render one markup in four presentations, selected with the `listStyle` prop. It applies to every list block in the content and composes with `variant` (a `filled` surface fills the `card`/`grouped` backgrounds).

```tsx
// React
<ConversedContent blocks={blocks} listStyle="card" />   {/* 'plain' (default) | 'card' | 'grouped' | 'directory' */}
```

```html
<!-- Angular -->
<conversed-content [blocks]="blocks()" listStyle="card"></conversed-content>
```

| `listStyle`  | Looks like                                                        | Best for |
| ------------ | ----------------------------------------------------------------- | -------- |
| `plain` *(default)* | Borderless clean rows — a small primary bullet, then the item. | Any list; the lightest, most chat-native default. |
| `card`       | Each item in its own outlined card (no bullet).                   | Lists whose items are discrete, tappable objects. |
| `grouped`    | iOS-style bordered box with hairline row dividers (no bullet).    | Dense, settings-style groupings. |
| `directory`  | Leading circular initial avatar (first letter of the item) + content. | Lists of named entities — people, animals, files. |

Notes:
- Ordered lists always show their number as the marker; the `card`, `grouped`, and `directory` styles only replace the **unordered** bullet.
- The `directory` avatar tint uses `--conversed-primary-alpha15` (the primary color at 15%); the initial is derived from the item's first visible character.

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
  surface: '#ffffff',        // fill for the `filled` variant
  borderColor: '#d1d1d6',
  borderRadius: '10px',
  fontFamily: 'inherit'
}} />
```

Generate resolved CSS from a theme (or defaults) with `generateCssVariables(theme?)`.

## Chart Colors

Chart series derive from `--conversed-primary` plus the `CHART_SERIES_COLORS` palette — the first series follows your brand color, others cycle the palette:

```ts
import { CHART_SERIES_COLORS } from '@conversed/core';
// ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5ac8fa']
```

A `chart` block already renders on a canvas inside `<ConversedContent>` — you don't need to do anything. Reach for `toChartJsConfig` only when you want to draw the chart yourself (a standalone canvas, a custom wrapper, or a non-Conversed surface).

`toChartJsConfig(block, { primaryColor })` turns a `ChartBlock` into a ready Chart.js config `{ type, data, options }`. Canvas can't read CSS variables, so pass a **resolved hex** for `primaryColor` (not `var(--conversed-primary)`); omit it to fall back to the palette's first color.

```ts
import { toChartJsConfig } from '@conversed/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// `block` is a ChartBlock (e.g. from parseMessageBlocks, or hand-built)
const config = toChartJsConfig(block, { primaryColor: '#c96442' });

const chart = new Chart(canvasEl, config);
// …later
chart.destroy();
```

The returned config is a plain object, so you can tweak it before handing it to Chart.js — e.g. merge extra `options`:

```ts
const config = toChartJsConfig(block, { primaryColor: '#c96442' });
config.options = { ...config.options, plugins: { legend: { display: true } } };
new Chart(canvasEl, config);
```

To resolve the primary color from a themed DOM node at runtime (mirroring what the components do internally):

```ts
const primaryColor =
  getComputedStyle(canvasEl).getPropertyValue('--conversed-primary').trim() || '#0071e3';
const config = toChartJsConfig(block, { primaryColor });
```

## Debug Logging (dev)

Silent by default. Enable on the parser and/or the components:

```tsx
const blocks = parseMessageBlocks(rawAiResponse, { debug: true });
<ConversedContent blocks={blocks} debug />
```
```html
<conversed-content [blocks]="blocks()" [debug]="true"></conversed-content>
```
