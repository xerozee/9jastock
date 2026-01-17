import jwt from "jsonwebtoken";

/**
 * Generates an Apple client secret JWT for Sign in with Apple OAuth.
 * Apple requires the client_secret to be a JWT signed with your private key.
 *
 * Required environment variables:
 * - APPLE_TEAM_ID: Your Apple Developer Team ID (10 characters)
 * - APPLE_KEY_ID: The Key ID from your Apple private key (10 characters)
 * - APPLE_ID: Your Services ID (client ID)
 * - APPLE_PRIVATE_KEY: The contents of your .p8 private key file
 */
export function generateAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = process.env.APPLE_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !keyId || !clientId || !privateKey) {
    console.error("Missing Apple OAuth configuration:", {
      hasTeamId: !!teamId,
      hasKeyId: !!keyId,
      hasClientId: !!clientId,
      hasPrivateKey: !!privateKey,
    });
    throw new Error(
      "Missing required Apple OAuth environment variables. " +
      "Ensure APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_ID, and APPLE_PRIVATE_KEY are set."
    );
  }

  // Handle private key formatting - replace escaped newlines with actual newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60 * 24 * 180; // 180 days (Apple allows max 6 months)

  const payload = {
    iss: teamId,
    iat: now,
    exp: now + expiresIn,
    aud: "https://appleid.apple.com",
    sub: clientId,
  };

  try {
    const token = jwt.sign(payload, formattedPrivateKey, {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: keyId,
      },
    });
    return token;
  } catch (error) {
    console.error("Failed to generate Apple client secret:", error);
    throw new Error(
      "Failed to generate Apple client secret. " +
      "Ensure APPLE_PRIVATE_KEY contains a valid ES256 private key."
    );
  }
}
