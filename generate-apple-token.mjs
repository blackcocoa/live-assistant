// Usage: node generate-apple-token.mjs <path-to-p8> <key-id> <team-id>
// Example: node generate-apple-token.mjs AuthKey_ABC123.p8 ABC123 TEAM456789
import { readFileSync } from "fs";
import { createSign } from "crypto";

const [, , p8Path, keyId, teamId] = process.argv;
if (!p8Path || !keyId || !teamId) {
  console.error("Usage: node generate-apple-token.mjs <p8-path> <key-id> <team-id>");
  process.exit(1);
}

const privateKey = readFileSync(p8Path, "utf8");
const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now, exp: now + 15552000 })).toString("base64url");

const sign = createSign("SHA256");
sign.update(`${header}.${payload}`);
const sig = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url");

console.log(`\nDeveloper Token (valid ~180 days):\n`);
console.log(`${header}.${payload}.${sig}`);
