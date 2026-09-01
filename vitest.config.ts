import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',          // node env for pure utility tests
    globals: true,                // allow describe/it/expect without import
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    reporters: ['verbose'],       // shows each test name clearly
  },
})

