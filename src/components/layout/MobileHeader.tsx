import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { NotificationBell } from '@/components/common/NotificationBell';
import { UserIcon, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/bills': 'My Bills',
  '/bills/new': 'Add Bill',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
};

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
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
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    // Check for bill detail page
    if (location.pathname.match(/^\/bills\/[^/]+$/)) {
      return 'Bill Details';
    }
    return 'Bill Vault';
  };

  // Determine if we should show back button
  const showBackButton = () => {
    const noBackPages = ['/dashboard', '/bills', '/settings', '/notifications'];
    return !noBackPages.includes(location.pathname);
  };

  // Check if we're on a main tab (show profile and notifications)
  const isMainTab = ['/dashboard', '/bills', '/settings', '/notifications'].includes(location.pathname);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Get avatar URL with Google profile fallback
  const getAvatarUrl = () => {
    // Check if we have a custom uploaded avatar (but not Google URLs which might have CORS issues)
    if (profile?.avatar_url && profile.avatar_url.trim() && profile.avatar_url.startsWith('http') && !profile.avatar_url.includes('googleusercontent.com')) {
      return profile.avatar_url;
    }

    // Always use fresh Google profile images from user metadata
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }

    return null;
  };

  const avatarUrl = getAvatarUrl();

  // Reset header image error when avatar URL changes
  useEffect(() => {
    setHeaderImageError(false);
  }, [avatarUrl]);

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
        ) : null}
        <h1 className="text-lg font-semibold text-foreground truncate">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isMainTab && <NotificationBell />}

        {/* Profile Dropdown - Only show on main tabs */}
        {isMainTab && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center p-1 rounded-full hover:bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                {avatarUrl && !headerImageError ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setHeaderImageError(true)}
                  />
                ) : null}
                <AvatarFallback className="bg-accent/20 text-accent text-sm">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
