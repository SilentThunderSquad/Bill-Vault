import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserIcon, Settings, LogOut, Crown, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import type { UserProfile } from '@/types';

// Page title mapping for admin routes
const adminPageTitles: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/bills': 'Bill Management',
  '/admin/analytics': 'System Analytics',
  '/admin/activity': 'Activity Logs',
  '/admin/storage': 'Storage Management',
  '/admin/settings': 'Admin Settings',
};

interface AdminMobileHeaderProps {
  className?: string;
}

export function AdminMobileHeader({ className }: AdminMobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin, signOut } = useAdminAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [headerImageError, setHeaderImageError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);
    };
    loadProfile();
  }, [user]);

  // Get the current page title
  const getTitle = () => {
    // Exact match first
    if (adminPageTitles[location.pathname]) {
      return adminPageTitles[location.pathname];
    }

    // Dynamic routing patterns
    if (location.pathname.startsWith('/admin/users/') && location.pathname.includes('/edit')) {
      return 'Edit User';
    }
    if (location.pathname.match(/^\/admin\/users\/[^/]+$/)) {
      return 'User Details';
    }
    if (location.pathname.match(/^\/admin\/bills\/[^/]+$/)) {
      return 'Bill Details';
    }

    return 'Admin Panel';
  };

  // Determine if we should show back button
  const showBackButton = () => {
    const noBackPages = ['/admin', '/admin/dashboard', '/admin/users', '/admin/bills', '/admin/analytics', '/admin/settings'];
    return !noBackPages.includes(location.pathname);
  };

  // Get admin avatar URL
  const getAvatarUrl = () => {
    if (profile?.avatar_url && profile.avatar_url.trim() && profile.avatar_url.startsWith('http') && !profile.avatar_url.includes('googleusercontent.com')) {
      return profile.avatar_url;
    }

    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }

    return null;
  };

  const avatarUrl = getAvatarUrl();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();
  const adminRoleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';
  const RoleIcon = isSuperAdmin ? Crown : UserCog;

  // Reset header image error when avatar URL changes
  useEffect(() => {
    setHeaderImageError(false);
  }, [avatarUrl]);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out of the admin dashboard?')) {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/admin/login');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border',
        'h-14 flex items-center justify-between px-4',
        'safe-area-top',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBackButton() ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 shrink-0 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Shield className="h-6 w-6 text-accent shrink-0" />
        )}
        <div className="min-w-0 flex-1 ml-2">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {getTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center p-1 rounded-full hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8 border border-border">
              {avatarUrl && !headerImageError ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  onError={() => setHeaderImageError(true)}
                />
              ) : null}
              <AvatarFallback className="bg-accent/20 text-accent text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <RoleIcon className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent font-medium">{adminRoleLabel}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserIcon className="mr-2 h-4 w-4" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}