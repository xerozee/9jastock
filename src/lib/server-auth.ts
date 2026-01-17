import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { connectToDatabase, User, IUser } from "./mongodb";

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

/**
 * Get the authenticated user from the NextAuth session
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: (session.user as Record<string, unknown>).firstName as string | null,
    lastName: (session.user as Record<string, unknown>).lastName as string | null,
  };
}

/**
 * Get the authenticated user with full database data
 * Returns null if not authenticated
 */
export async function getAuthenticatedUserFull(): Promise<IUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();

  return user as IUser | null;
}
