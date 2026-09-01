import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [react()], 
  resolve: {
    tsconfigPaths: true, 
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules', '.next'],
    browser: {
      provider: playwright(),
      instances: [{ browser: 'chromium' }]
    }
  },
})