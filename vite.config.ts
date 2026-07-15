import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const removeModuleType = {
  name: 'remove-module-type',
  transformIndexHtml(html: string) {
    return html
      .replace(/<script type="module" crossorigin>/g, '<script>')
      .replace(/<script type="module">/g, '<script>')
  },
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), removeModuleType],
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
      },
    },
  },
})
