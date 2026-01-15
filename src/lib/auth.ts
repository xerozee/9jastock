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
    let user = await User.findOne({ oauthId: userData.id }).lean();
    
    if (user) {
      const updatedUser = await User.findOneAndUpdate(
        { oauthId: userData.id },
        {
          $set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).lean();
      return updatedUser as IUser;
    }
    
    const existingByEmail = userData.email 
      ? await User.findOne({ email: userData.email.toLowerCase() }).lean()
      : null;
    
    if (existingByEmail) {
      const updatedUser = await User.findByIdAndUpdate(
        existingByEmail._id,
        {
          $set: {
            oauthId: userData.id,
            oauthProvider: 'replit',
            firstName: userData.firstName || existingByEmail.firstName,
            lastName: userData.lastName || existingByEmail.lastName,
            profileImageUrl: userData.profileImageUrl || existingByEmail.profileImageUrl,
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).lean();
      return updatedUser as IUser;
    }
    
    const newUser = await User.create({
      oauthId: userData.id,
      oauthProvider: 'replit',
      email: userData.email?.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
    });
    return newUser.toObject() as IUser;
  }
  
  const newUser = await User.create({
    email: userData.email?.toLowerCase(),
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
