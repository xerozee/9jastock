import { NextResponse } from "next/server";
import { generateAppleClientSecret } from "@/lib/appleClientSecret";

export async function GET() {
  const hasPrivateKey = !!process.env.APPLE_PRIVATE_KEY;
  const hasTeamId = !!process.env.APPLE_TEAM_ID;
  const hasKeyId = !!process.env.APPLE_KEY_ID;
  const hasClientId = !!process.env.APPLE_ID;
  
  let secretGenerated = false;
  let secretError = "";
  
  try {
    const secret = generateAppleClientSecret();
    secretGenerated = !!secret && secret.length > 0;
    if (!secretGenerated) {
      secretError = "Empty secret returned";
    }
  } catch (error) {
    secretError = error instanceof Error ? error.message : "Unknown error";
  }
  
  return NextResponse.json({
    config: {
      hasPrivateKey,
      hasTeamId,
      hasKeyId,
      hasClientId,
      clientId: process.env.APPLE_ID ? `${process.env.APPLE_ID.substring(0, 10)}...` : null,
    },
    secretGenerated,
    secretError: secretError || null,
    callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/apple`,
  });
}
