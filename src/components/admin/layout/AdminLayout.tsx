import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/admin/AdminAuthContext';
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
  X,
  Crown,
  UserCog
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
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

export function AdminLayout() {
  const { user, signOut, isSuperAdmin } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop (lg breakpoint = 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out of the admin dashboard?')) {
      await signOut();
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={
          isDesktop
            ? { x: 0 } // Always visible on desktop
            : { x: sidebarOpen ? 0 : '-100%' } // Animated on mobile
        }
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:relative lg:translate-x-0',
          'lg:flex lg:w-64 lg:flex-col'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Admin</h1>
                <p className="text-xs text-muted-foreground">Bill Vault</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-accent/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin info */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                {isSuperAdmin ? (
                  <Crown className="h-5 w-5 text-accent" />
                ) : (
                  <UserCog className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isSuperAdmin
                      ? 'bg-accent/20 text-accent'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                              (item.path === '/admin/dashboard' && location.pathname === '/admin');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className="text-xs opacity-70 truncate">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-lg transition-colors group"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-accent/10 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* breadcrumb path */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>/</span>
                <span className="text-foreground font-medium">
                  {navigationItems.find(item =>
                    item.path === location.pathname ||
                    (item.path === '/admin/dashboard' && location.pathname === '/admin')
                  )?.label || 'Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                Last update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}