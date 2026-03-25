import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldX,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Settings,
  Bell,
  BellRing
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelativeDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { useWarrantyNotifications } from '@/hooks/useWarrantyNotifications';
import { toast } from 'sonner';
import type { Bill } from '@/types';

interface WarrantyAlert {
  id: string;
  productName: string;
  daysUntilExpiry: number;
  expiryDate: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  billId: string;
}

function getUrgencyConfig(urgency: string) {
  switch (urgency) {
    case 'critical':
      return {
        icon: <ShieldX className="h-4 w-4" />,
        bgColor: 'bg-destructive/10',
        textColor: 'text-destructive',
        badge: { text: 'CRITICAL', variant: 'destructive' as const }
      };
    case 'high':
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        textColor: 'text-orange-700 dark:text-orange-300',
        badge: { text: 'URGENT', variant: 'destructive' as const }
      };
    case 'medium':
      return {
        icon: <Clock className="h-4 w-4" />,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        badge: { text: 'SOON', variant: 'secondary' as const }
      };
    case 'low':
    default:
      return {
        icon: <Calendar className="h-4 w-4" />,
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        badge: { text: 'REMINDER', variant: 'outline' as const }
      };
  }
}

const WarrantyAlertItem = React.memo(({ alert }: { alert: WarrantyAlert }) => {
  const config = getUrgencyConfig(alert.urgency);

  return (
    <Link
      to={`/bills/${alert.billId}`}
      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-full", config.bgColor)}>
          <span className={config.textColor}>
            {config.icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {alert.productName}
            </p>
            <Badge variant={config.badge.variant} className="text-xs">
              {config.badge.text}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {alert.daysUntilExpiry < 0
                ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                : alert.daysUntilExpiry === 0
                ? 'Expires today'
                : alert.daysUntilExpiry === 1
                ? 'Expires tomorrow'
                : `Expires in ${alert.daysUntilExpiry} days`
              }
            </span>
            <span>•</span>
            <span>{formatRelativeDate(alert.expiryDate)}</span>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
});

// Add displayName for better debugging
WarrantyAlertItem.displayName = 'WarrantyAlertItem';

const SummaryStatsGrid = React.memo(({ summary }: {
  summary: {
    expiredCount: number;
    criticalCount: number;
    warningCount: number;
    upcomingCount: number;
  }
}) => {
  const stats = [
    {
      label: 'Expired',
      value: summary.expiredCount,
      icon: <ShieldX className="h-4 w-4" />,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      label: 'Critical',
      value: summary.criticalCount,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      label: 'Warning',
      value: summary.warningCount,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Upcoming',
      value: summary.upcomingCount,
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center p-2">
          <div className={cn("inline-flex p-2 rounded-full mb-1", stat.bgColor)}>
            <span className={stat.color}>{stat.icon}</span>
          </div>
          <div className="text-lg font-semibold text-foreground">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});

// Add displayName for better debugging
SummaryStatsGrid.displayName = 'SummaryStatsGrid';

const EnhancedWarrantyAlertPanel = React.memo(({ bills: _bills }: { bills: Bill[] }) => {
  const {
    alerts,
    summary,
    loading,
    error,
    checkWarranties,
    processNotifications,
    requestPushPermission,
    sendTestNotification,
    canUsePushNotifications
  } = useWarrantyNotifications();

  const [processingNotifications, setProcessingNotifications] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Memoize expensive calculations
  const alertMetrics = useMemo(() => {
    const totalAlerts = summary.expiredCount + summary.criticalCount + summary.warningCount + summary.upcomingCount;
    const criticalAlerts = alerts.filter(alert => ['critical', 'high'].includes(alert.urgencyLevel));
    const hasUrgentAlerts = summary.expiredCount > 0 || summary.criticalCount > 0;

    return {
      totalAlerts,
      criticalAlerts,
      hasUrgentAlerts
    };
  }, [alerts, summary.expiredCount, summary.criticalCount, summary.warningCount, summary.upcomingCount]);

  const { totalAlerts, criticalAlerts, hasUrgentAlerts } = alertMetrics;

  const handleProcessNotifications = async () => {
    setProcessingNotifications(true);
    try {
      const result = await processNotifications();
      toast.success(
        `Processed ${result.alertsProcessed} alerts, created ${result.notificationsCreated} notifications`
      );
    } catch (error) {
      toast.error('Failed to process notifications');
    } finally {
      setProcessingNotifications(false);
    }
  };

  const handleRequestPermission = async () => {
    setRequestingPermission(true);
    try {
      const permission = await requestPushPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notifications denied');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Warranty Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-pulse">
              <div className="h-20 bg-muted rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Warranty Alerts</CardTitle>
            </div>
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={checkWarranties}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Don't show panel if no alerts
  if (totalAlerts === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className={cn(hasUrgentAlerts && "border-destructive/30")}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Warranty Alerts</CardTitle>
              {totalAlerts > 0 && (
                <Badge variant={hasUrgentAlerts ? "destructive" : "secondary"}>
                  {totalAlerts}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!canUsePushNotifications && (
                <Button
                  onClick={handleRequestPermission}
                  variant="ghost"
                  size="sm"
                  disabled={requestingPermission}
                  className="text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Enable Push
                </Button>
              )}
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {totalAlerts > 0 && (
            <CardDescription>
              {hasUrgentAlerts
                ? `${summary.expiredCount + summary.criticalCount} warranties need immediate attention`
                : 'Monitor upcoming warranty expirations'
              }
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <SummaryStatsGrid summary={summary} />

          {/* Critical/Urgent Alerts */}
          {criticalAlerts.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Urgent Alerts
                  </h4>
                  <Button
                    onClick={handleProcessNotifications}
                    disabled={processingNotifications}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <BellRing className="h-3 w-3 mr-1" />
                    Notify
                  </Button>
                </div>

                <div className="space-y-2">
                  {criticalAlerts.slice(0, 3).map((alert) => (
                    <WarrantyAlertItem
                      key={alert.bill.id}
                      alert={{
                        id: alert.bill.id,
                        productName: alert.bill.product_name || 'Unknown Product',
                        daysUntilExpiry: alert.daysUntilExpiry,
                        expiryDate: alert.bill.warranty_expiry,
                        urgency: alert.urgencyLevel,
                        billId: alert.bill.id
                      }}
                    />
                  ))}

                  {criticalAlerts.length > 3 && (
                    <div className="text-center pt-2">
                      <Link to="/bills?filter=warranty_expiring">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View {criticalAlerts.length - 3} more alerts
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link to="/bills?filter=warranty_expiring" className="flex-1">
              <Button variant="outline" className="w-full text-xs">
                View All Warranties
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>

            {canUsePushNotifications && (
              <Button
                onClick={handleTestNotification}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Add displayName for better debugging
EnhancedWarrantyAlertPanel.displayName = 'EnhancedWarrantyAlertPanel';

// Export the memoized component
export { EnhancedWarrantyAlertPanel };