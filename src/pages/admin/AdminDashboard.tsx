import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  HardDrive,
  Calendar,
  Clock,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBills: number;
  billsToday: number;
  billsThisWeek: number;
  billsThisMonth: number;
  storageUsed: number;
  notificationsToday: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user_email: string;
  timestamp: string;
  details?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while loading the admin dashboard. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'default', loading }: StatCardProps) {
  const colorClasses = {
    default: 'text-accent bg-accent/20',
    success: 'text-green-500 bg-green-500/20',
    warning: 'text-yellow-500 bg-yellow-500/20',
    danger: 'text-red-500 bg-red-500/20'
  };

  const changeColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-muted-foreground';

  // Safely format the value to ensure it's a string or number
  const safeValue = React.useMemo(() => {
    if (loading) return 0;
    if (value === null || value === undefined) return 0;
    if (typeof value === 'object') return 0;
    return value;
  }, [value, loading]);

  // Safely format the change value
  const safeChange = React.useMemo(() => {
    if (change === null || change === undefined) return undefined;
    if (typeof change === 'object') return undefined;
    return Number(change);
  }, [change]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', colorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{String(title)}</p>
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {typeof safeValue === 'string' ? safeValue : safeValue.toLocaleString()}
              </p>
            )}
            {safeChange !== undefined && changeLabel && !loading && (
              <div className="flex items-center gap-1">
                {safeChange > 0 ? (
                  <ArrowUpIcon className={cn('h-3 w-3', changeColor)} />
                ) : safeChange < 0 ? (
                  <ArrowDownIcon className={cn('h-3 w-3', changeColor)} />
                ) : null}
                <span className={cn('text-xs font-medium', changeColor)}>
                  {safeChange > 0 ? '+' : ''}{safeChange}% {String(changeLabel)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSystemMetrics();
    loadRecentActivities();
  }, []);

  const loadSystemMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch system overview metrics
      let { data: systemOverview, error: overviewError } = await supabase
        .from('admin_system_overview')
        .select('*')
        .single();

      // If admin_system_overview doesn't exist, try to calculate from other tables
      if (overviewError && overviewError.code === '42P01') {
        console.log('admin_system_overview table not found, calculating metrics from individual tables');

        // Calculate metrics from individual admin views
        const [
          { data: users, error: usersError },
          { data: bills, error: billsError }
        ] = await Promise.all([
          supabase.from('admin_user_overview').select('*'),
          supabase.from('admin_bills_overview').select('*')
        ]);

        if (!usersError && !billsError) {
          const now = new Date();
          const today = now.toDateString();
          const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          systemOverview = {
            total_users: users?.length || 0,
            active_users: users?.filter(u => u.activity_status === 'active').length || 0,
            total_bills: bills?.length || 0,
            bills_today: bills?.filter(b => new Date(b.created_at).toDateString() === today).length || 0,
            bills_week: bills?.filter(b => new Date(b.created_at) >= thisWeek).length || 0,
            bills_month: bills?.filter(b => new Date(b.created_at) >= thisMonth).length || 0,
            total_storage_used: bills?.length * 2 * 1024 * 1024 || 0, // Estimate 2MB per bill
            notifications_today: 0
          };
        }
      }

      if (systemOverview) {
        setMetrics({
          totalUsers: systemOverview.total_users || 0,
          activeUsers: systemOverview.active_users || 0,
          totalBills: systemOverview.total_bills || 0,
          billsToday: systemOverview.bills_today || 0,
          billsThisWeek: systemOverview.bills_week || 0,
          billsThisMonth: systemOverview.bills_month || 0,
          storageUsed: systemOverview.total_storage_used || 0,
          notificationsToday: systemOverview.notifications_today || 0
        });
      } else {
        // Fallback to default values if all queries fail
        setMetrics({
          totalUsers: 0,
          activeUsers: 0,
          totalBills: 0,
          billsToday: 0,
          billsThisWeek: 0,
          billsThisMonth: 0,
          storageUsed: 0,
          notificationsToday: 0
        });
      }
    } catch (err) {
      console.error('Error loading system metrics:', err);
      setError('Failed to load system metrics');
      // Set default values even on error to prevent crashes
      setMetrics({
        totalUsers: 0,
        activeUsers: 0,
        totalBills: 0,
        billsToday: 0,
        billsThisWeek: 0,
        billsThisMonth: 0,
        storageUsed: 0,
        notificationsToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);

      // Enhanced query: Join with user information to get actual names instead of UIDs
      const { data, error: logsError } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin_users:admin_id (email),
          admin_profiles:admin_id (full_name),
          resource_users:resource_id (email),
          resource_profiles:resource_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logsError) {
        console.warn('Direct join failed, falling back to manual lookup:', logsError);

        // Fallback: Get logs first, then lookup user names manually
        const { data: basicLogs, error: basicError } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (basicError) {
          throw basicError;
        }

        // Enhance logs with user information
        const enhancedLogs = await Promise.all(
          (basicLogs || []).map(async (log) => {
            let user_email = null;
            let user_full_name = null;

            // Get admin user info
            if (log.admin_id) {
              const { data: adminUser } = await supabase
                .from('admin_user_overview')
                .select('email, full_name')
                .eq('id', log.admin_id)
                .single();

              if (adminUser) {
                user_email = adminUser.email;
                user_full_name = adminUser.full_name;
              }
            }

            // If action is on a user resource, get that user's info instead
            if (log.resource_type === 'user' && log.resource_id) {
              const { data: resourceUser } = await supabase
                .from('admin_user_overview')
                .select('email, full_name')
                .eq('id', log.resource_id)
                .single();

              if (resourceUser) {
                user_email = resourceUser.email;
                user_full_name = resourceUser.full_name;
              }
            }

            return {
              ...log,
              user_id: log.resource_type === 'user' ? log.resource_id : log.admin_id,
              user_email,
              user_full_name
            };
          })
        );

        // Format activities for display
        const formattedActivities = enhancedLogs.map((activity, index) => ({
          id: activity.id || `activity-${index}`,
          action: activity.action || 'Unknown action',
          user_email: activity.user_full_name || activity.user_email || 'Unknown user',
          timestamp: activity.created_at || new Date().toISOString(),
          details: typeof activity.details === 'object'
            ? JSON.stringify(activity.details)
            : activity.details || null
        }));

        setRecentActivities(formattedActivities);
        return;
      }

      // Process joined data
      const processedLogs = (data || []).map(log => ({
        ...log,
        user_id: log.resource_type === 'user' ? log.resource_id : log.admin_id,
        user_email: log.resource_type === 'user'
          ? log.resource_users?.email || null
          : log.admin_users?.email || null,
        user_full_name: log.resource_type === 'user'
          ? log.resource_profiles?.full_name || null
          : log.admin_profiles?.full_name || null
      }));

      // Format activities for display
      const formattedActivities = processedLogs.map((activity, index) => ({
        id: activity.id || `activity-${index}`,
        action: activity.action || 'Unknown action',
        user_email: activity.user_full_name || activity.user_email || 'Unknown user',
        timestamp: activity.created_at || new Date().toISOString(),
        details: typeof activity.details === 'object'
          ? JSON.stringify(activity.details)
          : activity.details || null
      }));

      setRecentActivities(formattedActivities);
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      if (!timestamp) return 'Unknown';

      const now = new Date();
      const time = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(time.getTime())) {
        return 'Unknown';
      }

      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return time.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and management for Bill Vault
        </p>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group cursor-pointer"
        >
          <Eye className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">View Users</p>
            <p className="text-xs text-muted-foreground">Manage user accounts</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/bills')}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group cursor-pointer"
        >
          <FileText className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">View Bills</p>
            <p className="text-xs text-muted-foreground">Bill management</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/activity')}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group cursor-pointer"
        >
          <Activity className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">Activity Logs</p>
            <p className="text-xs text-muted-foreground">System activity</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:bg-accent/10 transition-colors text-left group cursor-pointer"
        >
          <Shield className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-medium text-foreground">System Settings</p>
            <p className="text-xs text-muted-foreground">Configure system</p>
          </div>
        </button>
      </motion.div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          change={metrics ? calculatePercentage(metrics.activeUsers, metrics.totalUsers) : undefined}
          changeLabel="of total"
          icon={TrendingUp}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Total Bills"
          value={metrics?.totalBills || 0}
          icon={FileText}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Storage Used"
          value={metrics ? formatBytes(metrics.storageUsed) : '0 Bytes'}
          icon={HardDrive}
          color="warning"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Bills Today"
          value={metrics?.billsToday || 0}
          icon={Calendar}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Bills This Week"
          value={metrics?.billsThisWeek || 0}
          icon={Clock}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Bills This Month"
          value={metrics?.billsThisMonth || 0}
          icon={TrendingUp}
          color="default"
          loading={loading}
        />
        <StatCard
          title="Notifications Today"
          value={metrics?.notificationsToday || 0}
          icon={AlertTriangle}
          color="warning"
          loading={loading}
        />
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">System Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Database: Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Authentication: Healthy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Storage: Available</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <button
            onClick={() => navigate('/admin/activity')}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {activitiesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
              // Ensure all values are safely converted to strings
              const safeActivity = {
                id: activity.id || `activity-${index}`,
                action: String(activity.action || 'Unknown action'),
                user_email: String(activity.user_email || 'Unknown user'),
                timestamp: activity.timestamp || new Date().toISOString(),
                details: activity.details ? String(activity.details) : null
              };

              return (
                <div key={safeActivity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors">
                  <div className="h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {safeActivity.action}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        by {safeActivity.user_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(safeActivity.timestamp)}
                      </p>
                    </div>
                    {safeActivity.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {safeActivity.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent admin activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboardWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AdminDashboard />
    </ErrorBoundary>
  );
}