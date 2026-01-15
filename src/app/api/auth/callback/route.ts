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

    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const isSecure = forwardedProto === "https" || process.env.NODE_ENV === "production";
    const baseUrl = `${forwardedProto}://${forwardedHost}`;

    if (!state || !nonce || !codeVerifier) {
      console.error("Missing auth cookies - state:", !!state, "nonce:", !!nonce, "codeVerifier:", !!codeVerifier);
      return NextResponse.redirect(`${baseUrl}/?auth_error=missing_cookies`);
    }

    const config = await getOidcConfig();
    
    const originalUrl = new URL(request.url);
    const correctedUrl = new URL(`${baseUrl}${originalUrl.pathname}${originalUrl.search}`);

    const tokens = await client.authorizationCodeGrant(config, correctedUrl, {
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
      secure: isSecure,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("Callback error:", error);
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}/?auth_error=callback_failed`);
  }
}
