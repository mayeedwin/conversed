# Conversed React demo — “Zao”

A Claude-inspired chat that showcases [`@conversed/react`](../../packages/react). Every assistant
reply is rendered from parsed AST blocks, and a live **Action Inspector** captures each
`onAction` event as you click table rows, stat cards, and follow-up chips.

It exercises the full block set: paragraphs, headings, the iOS grouped **list**, **stats**,
**tables** (with row-level actions), **callouts**, **charts**, **followups**, and the newer
**details**, **steps**, **timeline**, and **media** blocks.

## Prerequisites

This is part of a **pnpm workspace** — use [pnpm](https://pnpm.io), not npm or yarn.

> `npm install` fails here with `EUNSUPPORTEDPROTOCOL … workspace:*`. That's expected:
> the demo depends on the local `@conversed/*` packages via the `workspace:` protocol,
> which only pnpm resolves. Always install from the repo root.

## Run locally

From the **repo root**:

```bash
pnpm install
pnpm --filter @conversed/demo-react dev
```

Vite serves the demo (default `http://localhost:5173`). The demo links against the local
`@conversed/core` and `@conversed/react` sources, so library changes show up on rebuild.

## Build

```bash
pnpm --filter @conversed/demo-react build
```

Output goes to `demos/react-demo/dist/`.

## Deploy (Firebase Hosting)

Hosting is configured at the repo root in [`firebase.json`](../../firebase.json), targeting a
dedicated site (`conversed-zao-demo`) so it never overwrites another site. The `predeploy` hook
rebuilds the demo automatically.

```bash
# one-time, per Firebase project:
firebase hosting:sites:create conversed-zao-demo --project <your-project-id>

# deploy:
firebase deploy --only hosting --project <your-project-id>
```

## Anatomy

| File | Role |
| --- | --- |
| `src/App.tsx` | Chat + Action Inspector UI |
| `src/mockAi.ts` | Demo presets and the streaming mock (`streamConsoleResponse`) |
| `src/App.css` / `src/index.css` | Design system (warm paper, clay accent, serif + mono type) |
