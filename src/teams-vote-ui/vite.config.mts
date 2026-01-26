import { normalizePath } from 'vite'
import { gitHubSpaConfig } from "@quick-vite/gh-pages-spa/config";
import { solidVendorChunks } from '@quick-vite/gh-pages-spa/solidjs/vite';
import solid from 'vite-plugin-solid'
import { analyzer } from 'vite-bundle-analyzer'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import packageJson from './package.json' with { type: 'json' }
import path from 'node:path';

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