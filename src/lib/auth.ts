import { db } from "./db";
import { users, sessions, type User, type UpsertUser } from "./schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const ISSUER_URL = "https://replit.com/oidc";
const SESSION_COOKIE = "session_id";
const STATE_COOKIE = "oauth_state";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

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

function generateState(): string {
  return crypto.randomUUID();
}

export function getLoginUrl(origin: string): { url: string; state: string } {
  const state = generateState();
  const callbackUrl = `${origin}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.REPL_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  
  return {
    url: `${ISSUER_URL}/authorize?${params.toString()}`,
    state,
  };
}

export async function handleCallback(code: string, state: string, expectedState: string, origin: string): Promise<{ sessionId: string; user: User }> {
  if (state !== expectedState) {
    throw new Error("Invalid state parameter - possible CSRF attack");
  }
  
  const callbackUrl = `${origin}/api/auth/callback`;
  
  const tokenResponse = await fetch(`${ISSUER_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: process.env.REPL_ID!,
    }),
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${tokenResponse.status}`);
  }
  
  const tokens = await tokenResponse.json();
  
  const userInfoResponse = await fetch(`${ISSUER_URL}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  });
  
  if (!userInfoResponse.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  const claims = await userInfoResponse.json();
  
  if (!claims.sub) {
    throw new Error("No user ID in claims");
  }
  
  const user = await upsertUser({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
    profileImageUrl: claims.profile_image_url,
  });
  
  const sessionId = await createSession(user.id, claims);
  
  return { sessionId, user };
}

export function getLogoutUrl(origin: string): string {
  const params = new URLSearchParams({
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });
  return `${ISSUER_URL}/logout?${params.toString()}`;
}

export function isSecureOrigin(origin: string): boolean {
  return origin.startsWith("https://");
}

export { SESSION_COOKIE, STATE_COOKIE };
