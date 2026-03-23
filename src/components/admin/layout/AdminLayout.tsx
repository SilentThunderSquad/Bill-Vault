import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AdminBottomNav } from './AdminBottomNav';
import { AdminMobileHeader } from './AdminMobileHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Activity,
  HardDrive,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Crown,
  UserCog,
  UserIcon,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '@/types';

const adminNavigationItems = [
  {
    path: '/admin/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'System overview and metrics'
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: Users,
    description: 'User management and profiles'
  },
  {
    path: '/admin/bills',
    label: 'Bills',
    icon: FileText,
    description: 'Bill management and oversight'
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Advanced system analytics'
  },
  {
    path: '/admin/activity',
    label: 'Activity',
    icon: Activity,
    description: 'User and admin activity logs'
  },
  {
    path: '/admin/storage',
    label: 'Storage',
    icon: HardDrive,
    description: 'File storage management'
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    description: 'System and admin settings'
  }
];

interface AdminNavLinkProps {
  item: typeof adminNavigationItems[0];
  isActive: boolean;
  collapsed?: boolean;
  onClose?: () => void;
}

function AdminNavLink({ item, isActive, collapsed, onClose }: AdminNavLinkProps) {
  const linkElement = (
    <Link
      to={item.path}
      onClick={onClose}
      className={cn(
        'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="truncate">{item.label}</div>
          <div className="text-xs opacity-70 truncate">{item.description}</div>
        </div>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkElement} />
        <TooltipContent side="right" className="font-medium">
          <div>
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
}

interface AdminSidebarContentProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function AdminSidebarContent({ onClose, collapsed, onToggleCollapse }: AdminSidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className={cn("flex items-center p-4", collapsed ? "justify-center px-2" : "p-6")}>
        <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <Shield className={cn("text-accent transition-all", collapsed ? "h-8 w-8" : "h-7 w-7")} />
          {!collapsed && (
            <div>
              <div className="text-xl font-bold text-foreground">Admin</div>
              <div className="text-sm text-muted-foreground">Bill Vault</div>
            </div>
          )}
        </Link>
      </div>

      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2" : "px-3")}>
        {adminNavigationItems.map((item) => {
          const isActive = location.pathname === item.path ||
                          (item.path === '/admin/dashboard' && location.pathname === '/admin');
          return (
            <AdminNavLink
              key={item.path}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClose={onClose}
            />
          );
        })}
      </nav>

      {/* Collapse toggle button - desktop only */}
      {onToggleCollapse && (
        <div className={cn("px-3 py-2", collapsed && "px-2")}>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center w-full rounded-lg text-sm font-medium transition-all text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

      <div className={cn("p-4 border-t border-border", collapsed && "p-2")}>
        {collapsed ? (
          <p className="text-xs text-muted-foreground text-center">v1.0</p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">Admin Dashboard v1.0</p>
        )}
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function AdminSidebar({ open, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <AdminSidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="left" className="p-0 w-64 bg-card">
          <AdminSidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, signOut, isSuperAdmin } = useAdminAuth();
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
    if (window.confirm('Are you sure you want to sign out of the admin dashboard?')) {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/admin/login');
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Get avatar URL with Google profile fallback - same logic as user header
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

  const adminRoleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';
  const RoleIcon = isSuperAdmin ? Crown : UserCog;
  const roleIconColor = isSuperAdmin ? 'text-amber-500' : 'text-accent';
  const roleBadgeColor = isSuperAdmin ? 'bg-amber-500/20 text-amber-700 border-amber-500/30' : 'bg-accent/20 text-accent border-accent/30';

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-accent/10 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Home button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Role indicator - only on left side of profile */}
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium",
          roleBadgeColor
        )}>
          <RoleIcon className={cn("h-3.5 w-3.5", roleIconColor)} />
          <span>{adminRoleLabel}</span>
        </div>

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

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Initialize sidebar collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen h-[100dvh] bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        "flex-1 flex flex-col min-h-0 w-full",
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Mobile Header - visible only on mobile */}
        <AdminMobileHeader className="lg:hidden shrink-0" />

        {/* Main Content with page transitions */}
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          "-webkit-overflow-scrolling-touch",
          // Horizontal and top padding
          "px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8",
          // Bottom padding: 128px for mobile (nav 64px + safe area 34px + extra 30px), normal for desktop
          "pb-32 lg:pb-8"
        )}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation - Mobile only */}
        <AdminBottomNav />
      </div>
    </div>
  );
}