/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Inject the real @conversed/core version so the header always shows the
// library version the demo is built against (never a hardcoded string).
const coreVersion = JSON.parse(
  readFileSync(new URL('../../packages/core/package.json', import.meta.url), 'utf8'),
).version

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __CONVERSED_VERSION__: JSON.stringify(coreVersion),
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
