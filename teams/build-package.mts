import fs, { mkdir } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import stripJsonComments from 'strip-json-comments'

dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We don't need millisecond accuracy
const timestamp = new Date().toISOString().replaceAll('-', '').replaceAll('T', '').replaceAll(':', '').split('.')[0]

const devManifestPath = path.join(__dirname, "../manifest/manifest.source.jsonc");
const outputManifestPath = path.join(__dirname, "../package/manifest.json");
mkdir(dirname(outputManifestPath), { recursive: true }, (err) => {
  if (err) throw err;
});


const appId = process.env.TEAMS_APP_ID;
const appUrl = process.env.TEAMS_UI_URL;

if (!appId) {
  console.error("❌ TEAMS_APP_ID environment variable is not set");
  process.exit(1);
}
if (!appUrl) {
  console.error("❌ TEAMS_UI_URL environment variable is not set");
  process.exit(1);
}

function getEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ ${key} environment variable is not set`);
    process.exit(1);
  }
  return value;
}
// Read dev manifest
let manifestContent = fs.readFileSync(devManifestPath, "utf-8");

function replaceEnv(key: string) {
  manifestContent = manifestContent.replaceAll(`<${key}>`, getEnv(key));
}

manifestContent = stripJsonComments(manifestContent)
replaceEnv('TEAMS_APP_ID');
replaceEnv('TEAMS_UI_URL');
replaceEnv('TEAMS_APP_CLIENT_ID');
replaceEnv('TEAMS_APP_CLIENT_ID_URL');
replaceEnv('TEAMS_CHATBOT_CLIENT_ID');

// Write updated manifest
const manifestJson = JSON.parse(manifestContent);
manifestJson.version = `${manifestJson.version}.${timestamp}`
fs.writeFileSync(outputManifestPath, JSON.stringify(manifestJson, null, 2));

console.log(`Manifest updated`);
console.log(`  MANIFEST_VERSION=${manifestJson.version}`);

if (process.env.GITHUB_ENV) fs.appendFileSync(
  process.env.GITHUB_ENV,
  `MANIFEST_VERSION=${manifestJson.version}\n`
);