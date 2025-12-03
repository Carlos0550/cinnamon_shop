"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";

type AuthProps = {
  email: string;
  name: string;
  profileImage?: string;
  is_clerk?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthProps | null;
  loading: boolean;
};

export function useAuth() {
  const [baseUrl] = useState(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");
  const { isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const [state, setState] = useState<AuthState>({ token: null, user: null, loading: false });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true }));
        const res = await fetch(`${baseUrl}/shop/validate-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('invalid_token');
        const data = await res.json();
        const user: AuthProps = {
          email: data.email,
          name: data.name,
          profileImage: data.profileImage || '',
          is_clerk: !!data.is_clerk,
        };
        setState({ token, user, loading: false });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_exchange_done');
        setState({ token: null, user: null, loading: false });
      }
    })();
  }, [baseUrl]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    const res = await fetch(`${baseUrl}/shop/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setState((s) => ({ ...s, loading: false }));
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'login_failed');
    }
    const data = await res.json();
    const token = data.token as string;
    const user: AuthProps = {
      email: data.user.email,
      name: data.user.name,
      profileImage: data.user.profileImage || '',
      is_clerk: !!data.user.is_clerk,
    };
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_exchange_done', '1');
    setState({ token, user, loading: false });
    return { token, user };
  }, [baseUrl]);

  const exchangeClerkToBackend = useCallback(async () => {
    if (!isSignedIn || !clerkUser) return;
    setState((s) => ({ ...s, loading: true }));
    const email = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || email.split('@')[0];
    const profileImage = clerkUser?.imageUrl || '';
    const clerkToken = await getToken();

    if (!clerkToken) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const res = await fetch(`${baseUrl}/shop/clerk-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clerkToken}`,
      },
      body: JSON.stringify({ email, name, profileImage }),
    });
    if (!res.ok) {
      setState((s) => ({ ...s, loading: false }));
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'clerk_exchange_failed');
    }
    const data = await res.json();
    const token = data.token as string;
    const user: AuthProps = {
      email: data.user.email,
      name: data.user.name,
      profileImage: data.user.profileImage || profileImage || '',
      is_clerk: !!data.user.is_clerk,
    };
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_exchange_done', '1');
    setState({ token, user, loading: false });
    return { token, user };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, isSignedIn, clerkUser]);

  const exchangeAttemptedRef = useRef(false);
  useEffect(() => {
    const exchangedDone = typeof window !== 'undefined' ? localStorage.getItem('auth_exchange_done') : null;
    if (isSignedIn && !state.token && !exchangeAttemptedRef.current && !exchangedDone) {
      exchangeAttemptedRef.current = true;
      (async () => {
        try {
          await exchangeClerkToBackend();
        } catch {}
      })();
    }
  }, [isSignedIn, state.token, exchangeClerkToBackend]);

  const signOut = useCallback(async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_exchange_done');
    setState({ token: null, user: null, loading: false });
    // Intentar cerrar sesión también en Clerk si existe
    try { await clerkSignOut(); } catch {}
  }, [clerkSignOut]);

  const isAuthenticated = !!state.token && !!state.user;

  return {
    state,
    isAuthenticated,
    signIn,
    exchangeClerkToBackend,
    signOut,
  };
}

export default useAuth;
