import { normalizePath } from 'vite'
import path from 'node:path';
import fs from 'node:fs/promises';

import { gitHubSpaConfig } from "@quick-vite/gh-pages-spa/config";
import { solidVendorChunks } from '@quick-vite/gh-pages-spa/solidjs/vite';
import solid from 'vite-plugin-solid'

import { analyzer } from 'vite-bundle-analyzer'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import packageJson from './package.json' with { type: 'json' }

export default gitHubSpaConfig(packageJson, {
  plugins: [
    solid(),
    // always analyze, this seems to keep the bundle down
    analyzer({ analyzerMode: process.argv.includes('--analyze-bundle') ? 'server' : "json" }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './src/static/teams/auth_return.html')),
          dest: 'teams',
          transform(content: string) {
            return content
              .replace(
                '{TEAMS_VERSION}',
                packageJson.dependencies['@microsoft/teams-js'].replace('^', '')
              )
          }
        }
      ]
    }),
    // Copy index.html for static routes so teams doesn't trip on 404
    copyIndexForRoutes([
      '/teams/tab/',
      '/teams/spinner/'
    ])
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

// TODO don't run on error
function copyIndexForRoutes(routes: string[]) {
  return {
    name: 'vite-plugin-copy-index-for-routes',
    apply: 'build',
    closeBundle: async () => {
      
      const outDir = path.resolve(__dirname, 'dist');
      const indexFile = path.join(outDir, 'index.html');

      for (const route of routes) {
        let targetPath = route.endsWith('.html')
          ? path.join(outDir, route)
          : path.join(outDir, route, 'index.html');

        // Ensure directory exists
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        // Copy index.html to target
        await fs.copyFile(indexFile, targetPath);
        console.log(`Copied index.html -> ${targetPath}`);
      }
    }
  };
}