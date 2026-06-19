import { readFile, writeFile } from "node:fs/promises";

const envFile = ".open-next/cloudflare/next-env.mjs";
const sensitiveKeyPattern = /(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|ACCESS_KEY|CLIENT_SECRET)/i;
const exportPattern = /^export const (\w+) = (\{.*\});$/gm;

const source = await readFile(envFile, "utf8");
let replacements = 0;
let removedKeys = new Set();

const sanitized = source.replace(exportPattern, (match, mode, json) => {
  const values = JSON.parse(json);

  for (const key of Object.keys(values)) {
    if (!key.startsWith("NEXT_PUBLIC_") && sensitiveKeyPattern.test(key)) {
      delete values[key];
      removedKeys.add(key);
    }
  }

  replacements += 1;
  return `export const ${mode} = ${JSON.stringify(values)};`;
});

if (replacements === 0) {
  throw new Error(`No environment exports found in ${envFile}`);
}

await writeFile(envFile, `${sanitized.trim()}\n`);

if (removedKeys.size) {
  console.log(`Removed bundled Cloudflare env fallbacks: ${[...removedKeys].sort().join(", ")}`);
} else {
  console.log("No bundled Cloudflare env fallbacks needed sanitizing.");
}
