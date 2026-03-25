import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShieldX,
  AlertTriangle,
  Clock,
  Calendar,
  ArrowRight,
  Settings,
  Bell,
  ChevronDown,
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWarrantyNotifications } from '@/hooks/useWarrantyNotifications';
import { toast } from 'sonner';

const ModernWarrantyAlertPanel = React.memo(() => {
  const {
    alerts,
    summary,
    loading,
    error,
    checkWarranties,
    processNotifications,
    requestPushPermission,
    canUsePushNotifications
  } = useWarrantyNotifications();

  const [isExpanded, setIsExpanded] = useState(false);
  const [processingNotifications, setProcessingNotifications] = useState(false);

  // Memoize calculations
  const alertData = useMemo(() => {
    const totalAlerts = summary.expiredCount + summary.criticalCount + summary.warningCount + summary.upcomingCount;
    const urgentCount = summary.expiredCount + summary.criticalCount;
    const upcomingCount = summary.warningCount + summary.upcomingCount;

    const criticalAlerts = alerts.filter(alert =>
      ['critical', 'high'].includes(alert.urgencyLevel)
    ).slice(0, 3);

    // Calculate health score (0-100)
    const healthScore = totalAlerts === 0 ? 100 : Math.max(0, 100 - (urgentCount * 20) - (upcomingCount * 5));

    return {
      totalAlerts,
      urgentCount,
      upcomingCount,
      criticalAlerts,
      healthScore,
      hasUrgentAlerts: urgentCount > 0
    };
  }, [alerts, summary]);

  const { totalAlerts, urgentCount, upcomingCount, criticalAlerts, healthScore, hasUrgentAlerts } = alertData;

  const handleProcessNotifications = async () => {
    setProcessingNotifications(true);
    try {
      const result = await processNotifications();
      toast.success(`Created ${result.notificationsCreated} notifications`);
    } catch (error) {
      toast.error('Failed to process notifications');
    } finally {
      setProcessingNotifications(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded animate-pulse bg-muted" />
            <div className="h-4 w-24 rounded animate-pulse bg-muted" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 rounded-lg animate-pulse bg-muted" />
            <div className="space-y-2">
              <div className="h-3 rounded animate-pulse bg-muted" />
              <div className="h-3 w-3/4 rounded animate-pulse bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Warranty System</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button
            onClick={checkWarranties}
            variant="outline"
            size="sm"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive-foreground transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02]"
          >
            <span className="font-medium">Retry</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No alerts - healthy state
  if (totalAlerts === 0) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">All Warranties Protected</h3>
              <p className="text-xs text-muted-foreground">No expiring warranties found</p>
            </div>
            <div className="flex justify-center pt-2">
              <Link to="/bills" className="group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 cursor-pointer hover:scale-105 px-4 py-2 font-medium"
                >
                  View All Bills
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      hasUrgentAlerts && "border-destructive/30 shadow-sm"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              hasUrgentAlerts ? "bg-destructive/10" : "bg-accent/10"
            )}>
              {hasUrgentAlerts ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <Shield className="h-4 w-4 text-accent" />
              )}
            </div>
            <div>
              <CardTitle className="text-base leading-none">Warranty Monitor</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasUrgentAlerts ? 'Action Required' : 'System Health'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!canUsePushNotifications && (
              <Button
                onClick={requestPushPermission}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm hover:bg-accent/50 hover:text-accent-foreground border border-transparent hover:border-accent/30 transition-all duration-200 cursor-pointer font-medium"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Alerts
              </Button>
            )}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-accent-foreground border border-transparent hover:border-accent/30 transition-all duration-200 cursor-pointer hover:scale-105"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Overview */}
        <div className={cn(
          "rounded-lg p-4 border",
          hasUrgentAlerts
            ? "bg-destructive/5 border-destructive/20"
            : healthScore >= 80
            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
            : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-lg font-bold",
                  hasUrgentAlerts
                    ? "text-destructive"
                    : healthScore >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-yellow-600 dark:text-yellow-400"
                )}>
                  {hasUrgentAlerts ? urgentCount : healthScore}
                  {!hasUrgentAlerts && <span className="text-sm font-normal">%</span>}
                </span>
                <Badge
                  variant={
                    hasUrgentAlerts
                      ? "destructive"
                      : healthScore >= 80
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {hasUrgentAlerts ? 'URGENT' : healthScore >= 80 ? 'HEALTHY' : 'ATTENTION'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasUrgentAlerts
                  ? `${urgentCount} warranties need immediate action`
                  : `Warranty health score • ${upcomingCount} upcoming`
                }
              </p>
            </div>

            {!hasUrgentAlerts && (
              <div className="text-right">
                <TrendingUp className={cn(
                  "h-5 w-5",
                  healthScore >= 80 ? "text-emerald-500" : "text-yellow-500"
                )} />
              </div>
            )}
          </div>

          {/* Health Progress Bar (only for non-urgent states) */}
          {!hasUrgentAlerts && (
            <div className="space-y-2">
              <Progress
                value={healthScore}
                className="h-2"
                indicatorClassName={cn(
                  healthScore >= 80 ? "bg-emerald-500" : "bg-yellow-500"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>Health Score</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>

        {/* Urgent Alerts (if any) */}
        <AnimatePresence>
          {hasUrgentAlerts && criticalAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Critical Items ({criticalAlerts.length})
                </h4>
                <Button
                  onClick={handleProcessNotifications}
                  disabled={processingNotifications}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent-foreground border border-accent/30 hover:border-accent/50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] font-medium"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {processingNotifications ? 'Sending...' : 'Send Alerts'}
                </Button>
              </div>

              {criticalAlerts.map((alert, index) => (
                <motion.div
                  key={alert.bill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/bills/${alert.bill.id}`}
                    className="group block p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 hover:border-destructive/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-destructive/20 group-hover:bg-destructive/30 transition-colors">
                        <ShieldX className="h-3 w-3 text-destructive group-hover:text-destructive/80 transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-destructive truncate transition-colors">
                            {alert.bill.product_name || 'Unknown Product'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground group-hover:text-destructive/70 transition-colors">
                          {alert.daysUntilExpiry < 0
                            ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                            : alert.daysUntilExpiry === 0
                            ? 'Expires today'
                            : `Expires in ${alert.daysUntilExpiry} days`
                          }
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row - Breakdown Toggle & Primary Action */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            {/* Breakdown Toggle Button */}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="group h-9 px-4 justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-accent/20 border border-transparent hover:border-accent/30 transition-all duration-200 cursor-pointer min-w-[200px] sm:min-w-[220px] flex-shrink-0"
            >
              <span className="group-hover:font-medium transition-all">
                {isExpanded ? 'Hide breakdown' : 'View breakdown'}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200 group-hover:scale-110 ml-2",
                isExpanded && "rotate-180"
              )} />
            </Button>

            {/* Primary Action Button */}
            <Link to="/bills?filter=warranty_expiring" className="block group flex-1 sm:flex-initial sm:min-w-[240px] sm:max-w-[280px]">
              <Button
                variant={hasUrgentAlerts ? "default" : "outline"}
                className={cn(
                  "w-full transition-all duration-200 cursor-pointer text-sm font-medium",
                  hasUrgentAlerts
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md hover:shadow-lg hover:scale-[1.02] border-destructive hover:border-destructive/70 px-6 py-3"
                    : "border-accent/50 hover:border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground hover:shadow-md hover:scale-[1.01] px-6 py-3"
                )}
                size="default"
              >
                <span className="group-hover:font-semibold transition-all flex items-center gap-2">
                  {hasUrgentAlerts ? 'Manage Critical' : 'View Warranties'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Expandable Stats Grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 pt-2"
              >
                <div className="group text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20 transition-all duration-200 cursor-default hover:shadow-sm hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldX className="h-5 w-5 text-destructive group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-semibold text-destructive group-hover:font-bold transition-all">{summary.expiredCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors font-medium">Expired</div>
                </div>

                <div className="group text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20 transition-all duration-200 cursor-default hover:shadow-sm hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-semibold text-orange-600 group-hover:font-bold transition-all">{summary.criticalCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors font-medium">Critical</div>
                </div>

                <div className="group text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20 transition-all duration-200 cursor-default hover:shadow-sm hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-semibold text-yellow-600 group-hover:font-bold transition-all">{summary.warningCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors font-medium">Warning</div>
                </div>

                <div className="group text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20 transition-all duration-200 cursor-default hover:shadow-sm hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-semibold text-blue-600 group-hover:font-bold transition-all">{summary.upcomingCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors font-medium">Upcoming</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

ModernWarrantyAlertPanel.displayName = 'ModernWarrantyAlertPanel';

export { ModernWarrantyAlertPanel };