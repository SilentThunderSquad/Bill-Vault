import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertTriangle, Shield, LogOut } from 'lucide-react';

export function AdminProtectedRoute() {
  const { user, loading, isAdmin, error, signOut } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show error state instead of redirecting (prevents infinite loop)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>

          <div className="space-y-4">
            {error.includes('database not configured') && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-left">
                <h3 className="font-medium text-sm text-foreground flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-accent" />
                  Database Setup Required
                </h3>
                <p className="text-xs text-muted-foreground">
                  Run the admin database migration:
                </p>
                <code className="text-xs bg-muted p-2 rounded mt-1 block">
                  Apply supabase/admin.sql to your Supabase instance
                </code>
              </div>
            )}

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only redirect if user is not authenticated at all
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}