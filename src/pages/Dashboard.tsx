import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { useProfile } from '@/hooks/useProfile';
import { useAnalyticsSettings } from '@/hooks/useAnalyticsSettings';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentBills } from '@/components/dashboard/RecentBills';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WarrantyTimeline } from '@/components/dashboard/WarrantyTimeline';
import { ModernWarrantyAlertPanel } from '@/components/dashboard/ModernWarrantyAlertPanel';
import { WarrantyDevTestingPanel } from '@/components/development/WarrantyDevTestingPanel';
import { MonthlyUploadsChart } from '@/components/dashboard/MonthlyUploadsChart';
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { getWarrantyStatus } from '@/utils/formatters';
import { shouldShowAnalytics } from '@/utils/chartHelpers';
import { motion } from 'framer-motion';
import { FlaskConical, X } from 'lucide-react';
import type { DashboardStats } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { bills, loading, fetchBills } = useBills();
  const { profile } = useProfile();
  const { analyticsEnabled, loading: analyticsLoading } = useAnalyticsSettings();
  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const stats: DashboardStats = {
    total: bills.length,
    active: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'active').length,
    expiringSoon: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expiring').length,
    expired: bills.filter((b) => getWarrantyStatus(b.warranty_expiry) === 'expired').length,
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {bills.length === 0
            ? 'Start by adding your first bill'
            : `You have ${stats.active} active warranties`}
        </p>
      </motion.div>

      {/* Modern Warranty Alert Panel - Clean, actionable warranty monitoring */}
      <motion.div variants={itemVariants}>
        <ModernWarrantyAlertPanel />
      </motion.div>

      {/* Development Testing Panel - Only in development mode */}
      {import.meta.env.DEV && (
        <motion.div variants={itemVariants}>
          {!showDevPanel ? (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowDevPanel(true)}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Show Dev Testing Panel
              </Button>
            </div>
          ) : (
            <WarrantyDevTestingPanel onClose={() => setShowDevPanel(false)} />
          )}
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <StatsGrid stats={stats} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* Analytics Section - Conditionally Rendered */}
      {!analyticsLoading && analyticsEnabled && shouldShowAnalytics(bills.length) && (
        <motion.div variants={itemVariants}>
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            <MonthlyUploadsChart bills={bills} />
            <CategoryDistributionChart bills={bills} />
          </div>
        </motion.div>
      )}

      {/* Analytics Info Message */}
      {!analyticsLoading && analyticsEnabled && !shouldShowAnalytics(bills.length) && bills.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              📊 Analytics will appear once you have at least 3 bills. You currently have {bills.length} bill{bills.length === 1 ? '' : 's'}.
            </p>
          </div>
        </motion.div>
      )}

      {/* Analytics Disabled Message */}
      {!analyticsLoading && !analyticsEnabled && bills.length >= 3 && (
        <motion.div variants={itemVariants}>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              📊 Analytics are currently disabled. Enable them in <Link to="/settings" className="text-accent underline hover:text-accent/80">Settings</Link> to see charts and insights.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <RecentBills bills={bills.slice(0, 5)} />
        <WarrantyTimeline bills={bills} />
      </motion.div>
    </motion.div>
  );
}
