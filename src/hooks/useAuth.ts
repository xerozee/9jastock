"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/lib/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (response.status === 401) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const user = await response.json();
      setState({ 
        user, 
        isLoading: false, 
        isAuthenticated: !!user 
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  const login = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  return {
    ...state,
    logout,
    login,
    refetch: fetchUser,
  };
}
