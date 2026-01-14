import * as client from "openid-client";
import { db } from "./db";
import { users, sessions, type User, type UpsertUser } from "./schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";
const SESSION_COOKIE = "session_id";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

let oidcConfig: Awaited<ReturnType<typeof client.discovery>> | null = null;

async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
  }
  return oidcConfig;
}

export async function getSession(): Promise<{ user: User; claims: any } | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionId) return null;
  
  const [sessionData] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sid, sessionId));
  
  if (!sessionData || new Date(sessionData.expire) < new Date()) {
    return null;
  }
  
  const sess = sessionData.sess as any;
  if (!sess.userId) return null;
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, sess.userId));
  
  if (!user) return null;
  
  return { user, claims: sess.claims };
}

export async function upsertUser(userData: UpsertUser): Promise<User> {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function createSession(userId: string, claims: any): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expire = new Date(Date.now() + SESSION_TTL);
  
  await db.insert(sessions).values({
    sid: sessionId,
    sess: { userId, claims },
    expire,
  });
  
  return sessionId;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sid, sessionId));
}

export function getLoginUrl(hostname: string): string {
  const callbackUrl = `https://${hostname}/api/auth/callback`;
  const config = {
    client_id: process.env.REPL_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
  };
  
  return `${ISSUER_URL}/authorize?${new URLSearchParams(config).toString()}`;
}

export async function handleCallback(code: string, hostname: string): Promise<{ sessionId: string; user: User }> {
  const oidcConfig = await getOidcConfig();
  const callbackUrl = `https://${hostname}/api/auth/callback`;
  
  const tokens = await client.authorizationCodeGrant(oidcConfig, new URL(`${callbackUrl}?code=${code}`), {
    expectedState: undefined,
  });
  
  const claims = tokens.claims();
  
  if (!claims) {
    throw new Error("No claims in token response");
  }
  
  const user = await upsertUser({
    id: claims.sub,
    email: (claims as any).email as string | undefined,
    firstName: (claims as any).first_name as string | undefined,
    lastName: (claims as any).last_name as string | undefined,
    profileImageUrl: (claims as any).profile_image_url as string | undefined,
  });
  
  const sessionId = await createSession(user.id, claims);
  
  return { sessionId, user };
}

export async function getLogoutUrl(hostname: string): Promise<string> {
  const config = await getOidcConfig();
  return client.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: `https://${hostname}`,
  }).href;
}

export { SESSION_COOKIE };
