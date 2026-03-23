import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AdminUser extends User {
  role: 'admin' | 'super_admin';
  permissions?: string[];
}

interface AdminAuthError {
  message: string;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: AdminAuthError | null }>;
  signOut: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple session management (like user auth)
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Check admin role if user exists
      if (session?.user) {
        checkAdminRoleForUser(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      // Network error - don't block the app
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Check admin role if user exists, otherwise finish loading
        if (session?.user) {
          checkAdminRoleForUser(session.user.id);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setError(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Separate function for admin role checking (not in auth flow)
  const checkAdminRoleForUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Handle database schema issues
        if (error.code === 'PGRST116' || error.message?.includes('relation "public.user_roles" does not exist')) {
          console.warn('Admin database schema not found. Please run admin.sql migration.');
          setError('Admin database not configured. Please contact system administrator.');
          setIsAdmin(false);
          setIsSuperAdmin(false);
        } else if (error.code === 'PGRST116' || error.details?.includes('0 rows')) {
          // User has no role (table exists but user not in it)
          setError('Access denied. This account does not have admin privileges.');
          setIsAdmin(false);
          setIsSuperAdmin(false);
        } else {
          console.error('Database error checking admin role:', error);
          setError('Database connection error. Please try again.');
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } else if (!data) {
        setError('Access denied. This account does not have admin privileges.');
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } else {
        const adminRole = data.role;
        const hasAdminRole = adminRole === 'admin' || adminRole === 'super_admin';

        if (hasAdminRole) {
          setIsAdmin(true);
          setIsSuperAdmin(adminRole === 'super_admin');
          setError(null); // Clear any previous errors
        } else {
          setError('Access denied. This account does not have admin privileges.');
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      if (error instanceof Error && error.message.includes('relation "public.user_roles" does not exist')) {
        setError('Admin database not configured. Please apply the admin database schema.');
      } else {
        setError('Failed to verify admin access. Please try again.');
      }
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      // Always resolve loading state
      setLoading(false);
    }
  };

  // Public function for manual role checking
  const checkAdminRole = async (): Promise<boolean> => {
    if (!user) return false;
    await checkAdminRoleForUser(user.id);
    return isAdmin;
  };

  const signInWithProvider = async (provider: 'google' | 'github'): Promise<{ error: AdminAuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { error: { message } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSuperAdmin,
        error,
        signInWithProvider,
        signOut,
        checkAdminRole
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}