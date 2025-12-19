import { gitHubSpaConfig } from "@quick-vite/gh-pages-spa/config";
import { solidVendorChunks } from '@quick-vite/gh-pages-spa/solidjs/vite';
import solid from 'vite-plugin-solid'

import packageJson from './package.json' with { type: 'json' }

export default gitHubSpaConfig(packageJson, {
  plugins: [
    solid()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: solidVendorChunks,
      }
    },
    target: 'esnext',
    sourcemap: 'inline'
  }
})