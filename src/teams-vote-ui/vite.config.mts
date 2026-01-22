import { gitHubSpaConfig } from "@quick-vite/gh-pages-spa/config";
import { solidVendorChunks } from '@quick-vite/gh-pages-spa/solidjs/vite';
import solid from 'vite-plugin-solid'
import { analyzer } from 'vite-bundle-analyzer'

import packageJson from './package.json' with { type: 'json' }

export default gitHubSpaConfig(packageJson, {
  plugins: [
    solid(),
    // always analyze, this seems to keep the bundle down
    analyzer({ analyzerMode: process.argv.includes('--analyze-bundle') ? 'server' : "json" })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ...solidVendorChunks,
          'fluent-ui': [
            '@fluentui/tokens',
            '@fluentui/web-components',
            '@microsoft/fast-colors',
            '@microsoft/fast-foundation'
          ],
          'teams-sdk': [
            '@microsoft/teams-js'
          ]
        },
      }
    },
    target: 'esnext',
    sourcemap: 'inline',
    // TODO Temp remote debugging fix
    minify: false
  },
})