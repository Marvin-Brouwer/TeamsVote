/**
 * Builds the Teams app package: the manifest with its placeholders filled in, plus the two icons, zipped.
 * Upload the result in Teams (Apps → Manage your apps → Upload an app) or in the Teams Developer Portal.
 *
 * Reads TEAMS_APP_ID, BOT_CLIENT_ID and WEB_URL from the environment, or from teams/.env when it exists.
 * The version is 1.0.<GITHUB_RUN_NUMBER> in CI and 1.0.<timestamp> locally, so every build counts up.
 *
 * Usage: pnpm build:teams-package
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { zipSync } from 'fflate'
import stripJsonComments from 'strip-json-comments'

const teamsDirectory = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(teamsDirectory, '.env'), quiet: true })

function requireEnvironment(key: string): string {
	const value = process.env[key]
	if (!value) {
		console.error(`${key} is not set. See doc/setup.md, step 4.`)
		process.exit(1)
	}
	return value
}

const webUrl = new URL(requireEnvironment('WEB_URL'))
const version = `1.0.${process.env.GITHUB_RUN_NUMBER ?? new Date().toISOString().replaceAll(/\D/g, '').slice(0, 12)}`

const placeholders: Record<string, string> = {
	TEAMS_APP_ID: requireEnvironment('TEAMS_APP_ID'),
	BOT_CLIENT_ID: requireEnvironment('BOT_CLIENT_ID'),
	WEB_URL: webUrl.origin,
	WEB_DOMAIN: webUrl.host,
	VERSION: version,
}

let manifest = stripJsonComments(readFileSync(path.join(teamsDirectory, 'manifest.source.jsonc'), 'utf8'))
for (const [key, value] of Object.entries(placeholders)) manifest = manifest.replaceAll(`<${key}>`, value)

const leftOver = /<[A-Z_]+>/.exec(manifest)
if (leftOver) {
	console.error(`The manifest still has a placeholder nobody filled in: ${leftOver[0]}`)
	process.exit(1)
}

// Parsing doubles as a check that the comments came out cleanly.
const manifestJson = JSON.stringify(JSON.parse(manifest), undefined, 2)

const outputDirectory = path.join(teamsDirectory, 'dist')
const outputFile = path.join(outputDirectory, `tvote-${version}.zip`)
mkdirSync(outputDirectory, { recursive: true })
writeFileSync(outputFile, zipSync({
	'manifest.json': new TextEncoder().encode(manifestJson),
	'color.png': readFileSync(path.join(teamsDirectory, 'color.png')),
	'outline.png': readFileSync(path.join(teamsDirectory, 'outline.png')),
}))

console.info(`Built ${path.relative(process.cwd(), outputFile)} (version ${version})`)

if (process.env.GITHUB_OUTPUT) {
	appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\npackage=${outputFile}\n`)
}
