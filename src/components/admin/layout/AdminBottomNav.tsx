import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  BarChart3,
  HardDrive,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const adminNavItems = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Bills', href: '/admin/bills', icon: FileText },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, isAction: true },
  { label: 'More', href: null, icon: MoreHorizontal, isMore: true },
];

const moreNavItems = [
  { label: 'Activity Logs', href: '/admin/activity', icon: Activity },
  { label: 'Storage Management', href: '/admin/storage', icon: HardDrive },
  { label: 'Admin Settings', href: '/admin/settings', icon: Settings },
];

export function AdminBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const isActiveInMore = moreNavItems.some(item => isActive(item.href));

  const handleMoreItemClick = (href: string) => {
    navigate(href);
    setMoreSheetOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Background with blur and safe area */}
        <div className="bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
            {adminNavItems.map((item) => {
              const active = item.href ? isActive(item.href) : isActiveInMore;

              // Special styling for the Analytics button (action button)
              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href!)}
                    className="relative -mt-5 px-2"
                    aria-label={item.label}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-accent shadow-lg shadow-accent/25"
                    >
                      <item.icon className="h-5 w-5 text-white" />
                    </motion.div>
                  </button>
                );
              }

              // More menu trigger
              if (item.isMore) {
                return (
                  <Sheet key="more-menu" open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
                    <SheetTrigger className="relative flex flex-col items-center justify-center flex-1 h-full py-2 gap-1">
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors duration-200',
                            active ? 'text-accent' : 'text-muted-foreground'
                          )}
                        />
                      </motion.div>
                      <span
                        className={cn(
                          'text-[10px] font-medium transition-colors duration-200',
                          active ? 'text-accent' : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                      </span>
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="adminBottomNavIndicator"
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </SheetTrigger>

                    {/* More Menu Sheet Content - MOVED INSIDE Sheet */}
                    <SheetContent
                      side="bottom"
                      className="h-auto max-h-[80vh] rounded-t-lg border-t border-border"
                    >
                      <SheetHeader>
                        <SheetTitle>Admin Sections</SheetTitle>
                      </SheetHeader>
                      <div className="grid gap-2 pt-4">
                        {moreNavItems.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <motion.button
                              key={item.href}
                              onClick={() => handleMoreItemClick(item.href)}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                'flex items-center gap-3 p-4 rounded-lg text-left transition-colors',
                                active
                                  ? 'bg-accent/10 text-accent border border-accent/20'
                                  : 'hover:bg-muted text-foreground'
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              <div>
                                <h3 className="font-medium">{item.label}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {item.href === '/admin/activity' && 'View user and admin activity logs'}
                                  {item.href === '/admin/storage' && 'Manage file storage and cleanup'}
                                  {item.href === '/admin/settings' && 'Configure system settings'}
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                );
              }

              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href!)}
                  className="relative flex flex-col items-center justify-center flex-1 h-full py-2 gap-1"
                  aria-label={item.label}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 transition-colors duration-200',
                        active ? 'text-accent' : 'text-muted-foreground'
                      )}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors duration-200',
                      active ? 'text-accent' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="adminBottomNavIndicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}