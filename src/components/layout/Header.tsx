import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/common/NotificationBell';
import { ActivityDropdown } from '@/components/common/ActivityDropdown';
import { LogOut, Settings, Home, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '@/types';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick: _onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
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
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Home button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ActivityDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-colors">
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
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
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
      </div>
    </header>
  );
}
