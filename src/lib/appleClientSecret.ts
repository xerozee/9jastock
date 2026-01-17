import jwt from "jsonwebtoken";

let cachedSecret: string | null = null;
let cachedSecretExpiry: number = 0;

export function generateAppleClientSecret(): string {
  const now = Math.floor(Date.now() / 1000);
  
  if (cachedSecret && cachedSecretExpiry > now + 60) {
    return cachedSecret;
  }

  const privateKey = process.env.APPLE_PRIVATE_KEY;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = process.env.APPLE_ID;

  if (!privateKey || !teamId || !keyId || !clientId) {
    console.error("Missing Apple Sign-In configuration");
    return "";
  }

  const formattedPrivateKey = privateKey.includes("-----BEGIN PRIVATE KEY-----")
    ? privateKey.replace(/\\n/g, "\n")
    : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

  const expiresIn = 86400 * 180;
  const expiry = now + expiresIn;

  const token = jwt.sign({}, formattedPrivateKey, {
    algorithm: "ES256",
    expiresIn,
    audience: "https://appleid.apple.com",
    issuer: teamId,
    subject: clientId,
    keyid: keyId,
  });

  cachedSecret = token;
  cachedSecretExpiry = expiry;

  return token;
}
