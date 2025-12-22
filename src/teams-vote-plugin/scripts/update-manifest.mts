import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devManifestPath = path.join(__dirname, "../manifest/manifest.dev.json");
const outputManifestPath = path.join(__dirname, "../manifest.json");

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
  manifestContent = manifestContent.replace(`<${key}>`, getEnv(key));
}
replaceEnv('TEAMS_APP_ID');
replaceEnv('TEAMS_UI_URL');
replaceEnv('TEAMS_APP_CLIENT_ID');
replaceEnv('TEAMS_APP_CLIENT_ID_URL');

// Write updated manifest
const manifestJson = JSON.parse(manifestContent);
fs.writeFileSync(outputManifestPath, JSON.stringify(manifestJson, null, 2));

console.log(`✅ Manifest updated`);
