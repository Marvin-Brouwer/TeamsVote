import { builtinModules } from 'node:module'

import { defineConfig } from 'vite'

// Bundles our own code into one module for the web app's server to import. Dependencies stay in node_modules.
export default defineConfig({
  build: {
    target: 'node22',
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    ssr: 'src/index.mts',
    rolldownOptions: {
      external: [...builtinModules, /^node:/],
      output: {
        entryFileNames: 'index.mjs',
        format: 'es',
      },
    },
  },
})
