import { NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";
import { getOidcConfig, generateSessionId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const config = await getOidcConfig();
    
    const state = generateSessionId();
    const nonce = generateSessionId();
    
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const isSecure = forwardedProto === "https" || process.env.NODE_ENV === "production";
    const protocol = isSecure ? "https" : "http";
    const callbackUrl = `${protocol}://${forwardedHost}/api/auth/callback`;
    
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    
    const parameters: Record<string, string> = {
      redirect_uri: callbackUrl,
      scope: "openid email profile offline_access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
      prompt: "login consent",
    };

    const redirectTo = client.buildAuthorizationUrl(config, parameters);
    
    const cookieStore = await cookies();
    cookieStore.set("auth_state", state, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    cookieStore.set("auth_nonce", nonce, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    cookieStore.set("auth_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return NextResponse.redirect(redirectTo.href);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
