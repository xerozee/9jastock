import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, upsertUser, createSession, generateSessionId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const state = cookieStore.get("auth_state")?.value;
    const nonce = cookieStore.get("auth_nonce")?.value;
    const codeVerifier = cookieStore.get("auth_code_verifier")?.value;

    if (!state || !nonce || !codeVerifier) {
      console.error("Missing auth cookies");
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }

    const config = await getOidcConfig();
    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/api/auth/callback`;

    const tokens = await client.authorizationCodeGrant(config, new URL(request.url), {
      pkceCodeVerifier: codeVerifier,
      expectedState: state,
      expectedNonce: nonce,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      throw new Error("No claims in token response");
    }

    await upsertUser({
      id: claims.sub,
      email: claims.email as string | undefined,
      firstName: claims.first_name as string | undefined,
      lastName: claims.last_name as string | undefined,
      profileImageUrl: claims.profile_image_url as string | undefined,
    });

    const sessionId = generateSessionId();
    await createSession(sessionId, claims.sub, claims as Record<string, unknown>);

    cookieStore.delete("auth_state");
    cookieStore.delete("auth_nonce");
    cookieStore.delete("auth_code_verifier");
    
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
