import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastSyncedToken = useRef(null);

  // Synchronize authenticated user with Ratevia PostgreSQL backend
  const syncWithBackend = useCallback(async (currentSession) => {
    if (!currentSession?.access_token) return;

    // Prevent duplicate sync calls for same access token
    if (lastSyncedToken.current === currentSession.access_token) return;
    lastSyncedToken.current = currentSession.access_token;

    try {
      const response = await fetch(`${API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Merge Supabase user with PostgreSQL DB user info (role, id, etc.)
        setUser((prev) => ({
          ...currentSession.user,
          ...data.user,
        }));
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('[AuthContext] Backend sync failed:', errData.message || response.statusText);
      }
    } catch (err) {
      console.error('[AuthContext] Network error during backend user sync:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initialize session
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('[AuthContext] Error retrieving session:', error.message);
      }

      setSession(initialSession);
      if (initialSession?.user) {
        setUser(initialSession.user);
        syncWithBackend(initialSession);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          setUser(currentSession.user);
          await syncWithBackend(currentSession);
        } else {
          setUser(null);
          lastSyncedToken.current = null;
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [syncWithBackend]);

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase client is not configured in .env');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Email and Password
  const signInWithEmail = async (email, password) => {
    if (!supabase) throw new Error('Supabase client is not configured in .env');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign up with Email, Password and Name metadata
  const signUpWithEmail = async (email, password, name) => {
    if (!supabase) throw new Error('Supabase client is not configured in .env');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name?.trim() || undefined,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Reset password
  const resetPassword = async (email) => {
    if (!supabase) throw new Error('Supabase client is not configured in .env');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    lastSyncedToken.current = null;
  };

  const value = {
    session,
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
