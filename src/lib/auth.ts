import * as client from "openid-client";
import memoize from "memoizee";
import { connectToDatabase, User, Session, IUser } from "./mongodb";
import mongoose from "mongoose";

export const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function getUser(id: string): Promise<IUser | undefined> {
  await connectToDatabase();
  const user = await User.findById(id).lean();
  return user as IUser | undefined;
}

export async function getUserByEmail(email: string): Promise<IUser | undefined> {
  await connectToDatabase();
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  return user as IUser | undefined;
}

export interface UpsertUserData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export async function upsertUser(userData: UpsertUserData): Promise<IUser> {
  await connectToDatabase();
  
  if (userData.id) {
    const user = await User.findByIdAndUpdate(
      userData.id,
      {
        $set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).lean();
    return user as IUser;
  }
  
  const newUser = await User.create({
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    profileImageUrl: userData.profileImageUrl,
  });
  return newUser.toObject() as IUser;
}

export async function getSession(sid: string): Promise<{ userId: string } | null> {
  await connectToDatabase();
  const session = await Session.findOne({ sid }).lean();
  
  if (!session) return null;
  
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    await Session.deleteOne({ sid });
    return null;
  }
  
  return { userId: session.userId.toString() };
}

export async function createSession(sid: string, userId: string, claims: Record<string, unknown>): Promise<void> {
  await connectToDatabase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await Session.findOneAndUpdate(
    { sid },
    {
      $set: {
        sid,
        userId: new mongoose.Types.ObjectId(userId),
        expiresAt,
      },
    },
    { upsert: true }
  );
}

export async function deleteSession(sid: string): Promise<void> {
  await connectToDatabase();
  await Session.deleteOne({ sid });
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
