import { NextResponse } from "next/server";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  const checks = {
    googleClientId: {
      exists: !!googleClientId,
      length: googleClientId?.length || 0,
      format: googleClientId?.includes('.apps.googleusercontent.com') ? 'valid' : 'invalid - should end with .apps.googleusercontent.com',
    },
    googleClientSecret: {
      exists: !!googleClientSecret,
      length: googleClientSecret?.length || 0,
      format: (googleClientSecret?.length || 0) >= 20 ? 'likely valid' : 'too short',
    },
    nextAuthUrl: {
      exists: !!nextAuthUrl,
      value: nextAuthUrl,
    },
    nextAuthSecret: {
      exists: !!nextAuthSecret,
      length: nextAuthSecret?.length || 0,
    },
    expectedCallbackUrl: `${nextAuthUrl}/api/auth/callback/google`,
    instructions: [
      "1. Go to Google Cloud Console (https://console.cloud.google.com)",
      "2. Select your project",
      "3. Go to APIs & Services → Credentials",
      "4. Click on your OAuth 2.0 Client ID",
      "5. Add these Authorized redirect URIs:",
      `   - ${nextAuthUrl}/api/auth/callback/google`,
      "6. Add these Authorized JavaScript origins:",
      `   - ${nextAuthUrl}`,
      "7. Make sure OAuth consent screen is configured and published",
    ],
  };

  return NextResponse.json(checks, { status: 200 });
}
