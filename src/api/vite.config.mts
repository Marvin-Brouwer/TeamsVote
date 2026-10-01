import { builtinModules } from 'node:module'

import { defineConfig } from 'vite'

// Bundles our own code into one file, dependencies stay in node_modules.
export default defineConfig({
  build: {
    target: 'node22',
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    ssr: 'src/server.mts',
    rolldownOptions: {
      external: [...builtinModules, /^node:/],
      output: {
        entryFileNames: 'server.mjs',
        format: 'es',
      },
    },
  },
})
