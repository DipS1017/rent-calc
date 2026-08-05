/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps asset URLs relative so the built app works both at a domain root
// and under a GitHub Pages project subpath (e.g. /kirayaa/).
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  base: './',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
})
