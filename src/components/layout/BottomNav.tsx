import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Bills', href: '/bills', icon: Receipt },
  { label: 'Add', href: '/bills/new', icon: PlusCircle, isAction: true },
  { label: 'Alerts', href: '/notifications', icon: Bell, showBadge: true },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Background with blur and safe area */}
      <div className="bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);

            // Special styling for the Add button
            if (item.isAction) {
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
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

            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
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
                  {/* Notification badge */}
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
                    layoutId="bottomNavIndicator"
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
  );
}
