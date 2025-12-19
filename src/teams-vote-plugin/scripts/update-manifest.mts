import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devManifestPath = path.join(__dirname, "../manifest/manifest.dev.json");
const outputManifestPath = path.join(__dirname, "../manifest/manifest.json");

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
// Read dev manifest
const manifestContent = fs.readFileSync(devManifestPath, "utf-8");
const manifestJson = JSON.parse(manifestContent);

// Replace id
manifestJson.id = appId;
// Replace url
(manifestJson.composeExtensions as { id:string, commands: { id: string, taskInfo: any }[] }[])
  .find(extension => extension.id === 'voteExtension')!
  .commands.find(command => command.id === 'voteCommand')!
  .taskInfo.url = appUrl;

// Write updated manifest
fs.writeFileSync(outputManifestPath, JSON.stringify(manifestJson, null, 2));

console.log(`✅ Manifest updated`);
