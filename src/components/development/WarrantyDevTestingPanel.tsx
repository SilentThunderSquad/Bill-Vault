/**
 * Development Testing Panel for Warranty Notifications
 * Only available in development mode - provides comprehensive testing interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Monitor,
  Bell,
  RefreshCw,
  Trash2,
  Settings,
  TestTube,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
  WarrantyTestingUtils,
  type WarrantySystemStatus,
  type TestNotificationResult
} from '@/utils/warrantyTestingUtils';
import {
  warrantyE2ETester,
  type E2ETestSuite
} from '@/utils/warrantyE2ETester';

interface WarrantyDevTestingPanelProps {
  onClose?: () => void;
}

export const WarrantyDevTestingPanel: React.FC<WarrantyDevTestingPanelProps> = ({ onClose }) => {
  const [systemStatus, setSystemStatus] = useState<WarrantySystemStatus | null>(null);
  const [testResults, setTestResults] = useState<TestNotificationResult[]>([]);
  const [e2eResults, setE2eResults] = useState<E2ETestSuite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningE2E, setIsRunningE2E] = useState(false);

  // Test form state
  const [productName, setProductName] = useState('Development Test Product');
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number>(1);
  const [testType, setTestType] = useState<'expired' | 'critical' | 'warning' | 'upcoming'>('critical');

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    try {
      const status = await WarrantyTestingUtils.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error checking system status:', error);
      toast.error('Failed to check system status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleTest = async () => {
    setIsLoading(true);
    try {
      const result = await WarrantyTestingUtils.sendTestNotification(
        productName,
        daysUntilExpiry,
        testType
      );

      setTestResults(prev => [result, ...prev.slice(0, 9)]);

      if (result.success) {
        toast.success('Test notification sent!');
      } else {
        toast.error(result.error || 'Test notification failed');
      }
    } catch (error) {
      toast.error('Error running test');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullTest = async () => {
    setIsLoading(true);
    try {
      const { results, summary } = await WarrantyTestingUtils.runFullNotificationTest();
      setTestResults(prev => [...results, ...prev.slice(0, 6)]);

      toast.success(`Full test complete: ${summary.successful}/${summary.total} successful`);
    } catch (error) {
      toast.error('Error running full test');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionTest = async () => {
    setIsLoading(true);
    try {
      const result = await WarrantyTestingUtils.testPermissionFlow();
      setTestResults(prev => [result, ...prev.slice(0, 9)]);

      if (result.success) {
        toast.success('Permission test successful!');
        // Refresh system status to update permission state
        await checkSystemStatus();
      } else {
        toast.error(result.error || 'Permission test failed');
      }
    } catch (error) {
      toast.error('Error testing permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    await WarrantyTestingUtils.clearTestNotifications();
    toast.success('Test notifications cleared');
  };

  const handleForceUpdate = async () => {
    setIsLoading(true);
    const success = await WarrantyTestingUtils.forceServiceWorkerUpdate();
    if (success) {
      toast.success('Service Worker update triggered');
      setTimeout(checkSystemStatus, 1000);
    } else {
      toast.error('Failed to update Service Worker');
    }
    setIsLoading(false);
  };

  const handleLogDiagnostics = () => {
    WarrantyTestingUtils.logSystemDiagnostics();
    toast.success('Diagnostics logged to console');
  };

  const handleRunE2ETests = async () => {
    setIsRunningE2E(true);
    setE2eResults(null);

    try {
      toast.info('Running complete E2E test suite...');
      const results = await warrantyE2ETester.runCompleteTestSuite();
      setE2eResults(results);

      if (results.summary.failed === 0) {
        toast.success(`All tests passed! (${results.summary.passed}/${results.summary.total})`);
      } else {
        toast.error(`${results.summary.failed} test(s) failed out of ${results.summary.total}`);
      }
    } catch (error) {
      toast.error('E2E test suite failed to complete');
      console.error('E2E test error:', error);
    } finally {
      setIsRunningE2E(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
      case 'granted':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ {status}</Badge>;
      case 'unavailable':
      case 'denied':
        return <Badge variant="destructive">✗ {status}</Badge>;
      case 'default':
        return <Badge variant="secondary">⚪ {status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900">
              <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Warranty Testing Panel
                <Badge variant="outline" className="text-xs">DEV</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Development tools for testing warranty notifications
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">System Status</h3>
            <Button
              onClick={checkSystemStatus}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {systemStatus && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Environment:</span>
                <Badge variant="outline">{systemStatus.environment}</Badge>
              </div>
              <div className="flex justify-between">
                <span>PWA Support:</span>
                {getStatusBadge(systemStatus.pwaSupport ? 'available' : 'unavailable')}
              </div>
              <div className="flex justify-between">
                <span>Service Worker:</span>
                {getStatusBadge(systemStatus.serviceWorkerStatus)}
              </div>
              <div className="flex justify-between">
                <span>Notifications:</span>
                {getStatusBadge(systemStatus.notificationPermission)}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Single Test */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Single Notification Test</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="productName" className="text-xs">Product Name</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="h-8 text-sm"
                placeholder="Test Product"
              />
            </div>

            <div>
              <Label htmlFor="days" className="text-xs">Days Until Expiry</Label>
              <Input
                id="days"
                type="number"
                value={daysUntilExpiry}
                onChange={(e) => setDaysUntilExpiry(parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">Test Type</Label>
              <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSingleTest}
            disabled={isLoading}
            className="w-full h-9 text-sm"
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        </div>

        <Separator />

        {/* Batch Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Batch Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleFullTest}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 text-sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Full Test Suite
            </Button>

            <Button
              onClick={handlePermissionTest}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 text-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Test Permissions
            </Button>

            <Button
              onClick={handleClearNotifications}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Test Alerts
            </Button>

            <Button
              onClick={handleForceUpdate}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update SW
            </Button>
          </div>

          <Button
            onClick={handleLogDiagnostics}
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground"
          >
            📋 Log System Diagnostics to Console
          </Button>
        </div>

        <Separator />

        {/* E2E Test Suite */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">End-to-End Test Suite</h3>
          </div>

          <Button
            onClick={handleRunE2ETests}
            disabled={isRunningE2E}
            className="w-full h-9 text-sm"
            variant="default"
          >
            <Activity className="h-4 w-4 mr-2" />
            {isRunningE2E ? 'Running E2E Tests...' : 'Run Complete E2E Test Suite'}
          </Button>

          {e2eResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Test Results:</span>
                <Badge
                  variant={e2eResults.summary.failed === 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {e2eResults.summary.passed}/{e2eResults.summary.total} passed
                </Badge>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {e2eResults.results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/30 text-xs"
                  >
                    {result.status === 'pass' ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : result.status === 'fail' ? (
                      <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {result.testName}
                        {result.duration && <span className="text-muted-foreground ml-1">({result.duration}ms)</span>}
                      </p>
                      {result.error && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Completed in {e2eResults.summary.duration}ms
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Recent Manual Test Results</h3>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/30 text-sm"
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-xs text-destructive">
                          {result.error}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {testResults.length > 0 && (
                <Button
                  onClick={() => setTestResults([])}
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs"
                >
                  Clear Results
                </Button>
              )}
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Testing Instructions:</p>
              <ul className="space-y-1 text-xs">
                <li>• Enable notification permissions for proper testing</li>
                <li>• Check browser console for detailed logs</li>
                <li>• Test different notification types to verify styling</li>
                <li>• Use "Full Test Suite" to validate all scenarios</li>
                <li>• Clear test notifications to avoid clutter</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};