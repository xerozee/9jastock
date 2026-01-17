"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  image?: string | null;
  profileImageUrl?: string | null;
  shareId?: string | null;
  subscriptionStatus?: string;
  subscriptionCurrentPeriodEnd?: Date | null;
  onboardingCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        firstName: (session.user as Record<string, unknown>).firstName as string | null,
        lastName: (session.user as Record<string, unknown>).lastName as string | null,
        name: session.user.name,
        image: session.user.image,
        profileImageUrl: session.user.image,
        shareId: (session.user as Record<string, unknown>).shareId as string | null,
        subscriptionStatus:
          ((session.user as Record<string, unknown>).subscriptionStatus as string) || "free",
        subscriptionCurrentPeriodEnd: (session.user as Record<string, unknown>)
          .subscriptionCurrentPeriodEnd as Date | null,
        onboardingCompleted:
          ((session.user as Record<string, unknown>).onboardingCompleted as boolean) || false,
      }
    : null;

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const login = useCallback(() => {
    router.push("/login");
  }, [router]);

  const refetch = useCallback(async () => {
    // NextAuth automatically refetches session, but we can trigger a refresh
    router.refresh();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login,
    refetch,
  };
}
