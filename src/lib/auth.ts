import * as client from "openid-client";
import memoize from "memoizee";
import { db } from "./db";
import { users, sessions, type User, type UpsertUser } from "./schema";
import { eq } from "drizzle-orm";

export const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function upsertUser(userData: UpsertUser): Promise<User> {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

export async function getSession(sid: string): Promise<{ userId: string } | null> {
  const [session] = await db.select().from(sessions).where(eq(sessions.sid, sid));
  if (!session || !session.sess) return null;
  
  const sessData = session.sess as { userId?: string; passport?: { user?: { claims?: { sub?: string } } } };
  const userId = sessData.userId || sessData.passport?.user?.claims?.sub;
  
  if (!userId) return null;
  return { userId };
}

export async function createSession(sid: string, userId: string, claims: Record<string, unknown>): Promise<void> {
  const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await db
    .insert(sessions)
    .values({
      sid,
      sess: { userId, claims, passport: { user: { claims } } },
      expire,
    })
    .onConflictDoUpdate({
      target: sessions.sid,
      set: {
        sess: { userId, claims, passport: { user: { claims } } },
        expire,
      },
    });
}

export async function deleteSession(sid: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sid, sid));
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
