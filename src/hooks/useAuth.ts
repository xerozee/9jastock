"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  shareId?: string;
  subscriptionStatus?: string;
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
  const [extendedUser, setExtendedUser] = useState<User | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  const fetchUser = useCallback(async () => {
    if (session?.user?.id && !fetchingUser) {
      setFetchingUser(true);
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setExtendedUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch extended user data:", error);
      } finally {
        setFetchingUser(false);
      }
    }
  }, [session?.user?.id, fetchingUser]);

  useEffect(() => {
    if (session?.user?.id && !extendedUser) {
      fetchUser();
    }
  }, [session?.user?.id, extendedUser, fetchUser]);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const login = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;
  
  const user: User | null = extendedUser || (session?.user ? {
    id: (session.user as any).id,
    email: session.user.email || undefined,
    firstName: session.user.name?.split(' ')[0],
    lastName: session.user.name?.split(' ').slice(1).join(' '),
    profileImageUrl: session.user.image || undefined,
    subscriptionStatus: (session.user as any).subscriptionStatus,
    onboardingCompleted: (session.user as any).onboardingCompleted,
  } : null);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login,
    refetch: fetchUser,
  };
}
