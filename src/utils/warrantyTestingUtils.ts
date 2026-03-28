/**
 * Development Testing Utils for Warranty Notification System
 * Provides comprehensive testing capabilities for development environment
 */

import { pwaNotificationService } from '@/services/pwaNotificationService';
import type { PushNotificationPayload } from '@/services/pwaNotificationService';

export interface WarrantySystemStatus {
  environment: 'development' | 'production';
  serviceWorkerStatus: 'available' | 'unavailable' | 'error';
  notificationPermission: NotificationPermission;
  pwaSupport: boolean;
  registrationDetails?: {
    scope?: string;
    state?: string;
    waiting?: boolean;
  };
}

export interface TestNotificationResult {
  success: boolean;
  message: string;
  error?: string;
  timestamp: number;
}

export class WarrantyTestingUtils {
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Check comprehensive system status for warranty notifications
   */
  static async getSystemStatus(): Promise<WarrantySystemStatus> {
    const status: WarrantySystemStatus = {
      environment: this.isDevelopment ? 'development' : 'production',
      serviceWorkerStatus: 'unavailable',
      notificationPermission: Notification.permission,
      pwaSupport: false
    };

    try {
      // Check service worker availability
      if ('serviceWorker' in navigator) {
        status.pwaSupport = true;

        try {
          const registration = await navigator.serviceWorker.ready;
          status.serviceWorkerStatus = 'available';
          status.registrationDetails = {
            scope: registration.scope,
            state: registration.active?.state,
            waiting: registration.waiting !== null
          };
        } catch (error) {
          status.serviceWorkerStatus = 'error';
        }
      }
    } catch (error) {
      console.error('[WarrantyTestingUtils] Error checking system status:', error);
      status.serviceWorkerStatus = 'error';
    }

    return status;
  }

  /**
   * Send a test warranty notification with custom parameters
   */
  static async sendTestNotification(
    productName: string = 'Test Product',
    daysUntilExpiry: number = 1,
    testType: 'expired' | 'critical' | 'warning' | 'upcoming' = 'critical'
  ): Promise<TestNotificationResult> {
    const timestamp = Date.now();

    try {
      if (!this.isDevelopment) {
        return {
          success: false,
          message: 'Test notifications are only available in development mode',
          timestamp
        };
      }

      const testPayload = this.createTestPayload(productName, daysUntilExpiry, testType);

      await pwaNotificationService.showNotification(testPayload);

      return {
        success: true,
        message: `Test notification sent successfully for ${testType} warranty`,
        timestamp
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to send test notification',
        error: errorMessage,
        timestamp
      };
    }
  }

  /**
   * Create test notification payload
   */
  private static createTestPayload(
    productName: string,
    daysUntilExpiry: number,
    testType: string
  ): PushNotificationPayload {
    const basePayload = {
      tag: `test-warranty-${Date.now()}`,
      requireInteraction: true,
      data: {
        billId: 'test-bill-id',
        alertType: `test_${testType}`,
        url: '/bills/test',
        timestamp: new Date().toISOString()
      }
    };

    switch (testType) {
      case 'expired':
        return {
          ...basePayload,
          title: '🧪 TEST: Warranty Expired',
          body: `${productName} warranty expired ${Math.abs(daysUntilExpiry)} days ago (TEST NOTIFICATION)`,
        };
      case 'critical':
        return {
          ...basePayload,
          title: '🧪 TEST: Critical Warranty Alert',
          body: `${productName} warranty expires ${daysUntilExpiry === 0 ? 'today' : 'tomorrow'}! (TEST NOTIFICATION)`,
        };
      case 'warning':
        return {
          ...basePayload,
          title: '🧪 TEST: Warranty Warning',
          body: `${productName} warranty expires in ${daysUntilExpiry} days (TEST NOTIFICATION)`,
          requireInteraction: false
        };
      case 'upcoming':
        return {
          ...basePayload,
          title: '🧪 TEST: Upcoming Warranty',
          body: `${productName} warranty expires in ${daysUntilExpiry} days (TEST NOTIFICATION)`,
          requireInteraction: false
        };
      default:
        return {
          ...basePayload,
          title: '🧪 TEST: Warranty Notification',
          body: `Test notification for ${productName} (TEST NOTIFICATION)`,
        };
    }
  }

  /**
   * Test all notification types in sequence
   */
  static async runFullNotificationTest(): Promise<{
    results: TestNotificationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    if (!this.isDevelopment) {
      return {
        results: [{
          success: false,
          message: 'Full tests only available in development mode',
          timestamp: Date.now()
        }],
        summary: { total: 1, successful: 0, failed: 1 }
      };
    }

    const testCases = [
      { type: 'expired' as const, product: 'Laptop Warranty', days: -5 },
      { type: 'critical' as const, product: 'Phone Insurance', days: 0 },
      { type: 'warning' as const, product: 'TV Extended Warranty', days: 7 },
      { type: 'upcoming' as const, product: 'Car Warranty', days: 25 }
    ];

    const results: TestNotificationResult[] = [];
    let successful = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      // Small delay between notifications
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await this.sendTestNotification(
        testCase.product,
        testCase.days,
        testCase.type
      );

      results.push(result);
      if (result.success) successful++;
    }

    return {
      results,
      summary: {
        total: testCases.length,
        successful,
        failed: testCases.length - successful
      }
    };
  }

  /**
   * Request and test notification permissions
   */
  static async testPermissionFlow(): Promise<TestNotificationResult> {
    const timestamp = Date.now();

    try {
      if (!this.isDevelopment) {
        return {
          success: false,
          message: 'Permission testing only available in development mode',
          timestamp
        };
      }

      const status = await this.getSystemStatus();

      if (!status.pwaSupport) {
        return {
          success: false,
          message: 'PWA/Service Worker not supported in this environment',
          timestamp
        };
      }

      if (status.notificationPermission === 'granted') {
        // Test with existing permission
        await pwaNotificationService.testNotification();
        return {
          success: true,
          message: 'Notifications already granted and working',
          timestamp
        };
      } else if (status.notificationPermission === 'denied') {
        return {
          success: false,
          message: 'Notification permission denied - please reset in browser settings',
          timestamp
        };
      } else {
        // Request permission
        const permission = await pwaNotificationService.requestPermission();

        if (permission === 'granted') {
          await pwaNotificationService.testNotification();
          return {
            success: true,
            message: 'Permission granted and test notification sent',
            timestamp
          };
        } else {
          return {
            success: false,
            message: `Permission ${permission} - notifications will not work`,
            timestamp
          };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to test permission flow',
        error: errorMessage,
        timestamp
      };
    }
  }

  /**
   * Log comprehensive debug information
   */
  static logSystemDiagnostics(): void {
    if (!this.isDevelopment) {
      console.log('[WarrantyTestingUtils] Diagnostics only available in development mode');
      return;
    }

    console.group('🔧 Warranty System Diagnostics');

    console.log('Environment:', import.meta.env.MODE);
    console.log('PWA Support:', 'serviceWorker' in navigator);
    console.log('Notification Support:', 'Notification' in window);
    console.log('Push Support:', 'PushManager' in window);
    console.log('Current Permission:', Notification.permission);

    if (pwaNotificationService) {
      console.log('PWA Service Status:', pwaNotificationService.getStatus());
    }

    // Service Worker Details
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          console.log('Service Worker Registration:', {
            scope: registration.scope,
            active: registration.active?.state,
            waiting: registration.waiting?.state,
            installing: registration.installing?.state
          });
        })
        .catch(error => {
          console.error('Service Worker Registration Error:', error);
        });
    }

    console.groupEnd();
  }

  /**
   * Clear all test notifications
   */
  static async clearTestNotifications(): Promise<void> {
    if (!this.isDevelopment) {
      console.warn('[WarrantyTestingUtils] Clear function only available in development mode');
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications();

        // Clear only test notifications
        const testNotifications = notifications.filter(notification =>
          notification.tag && notification.tag.startsWith('test-')
        );

        testNotifications.forEach(notification => notification.close());

        console.log(`[WarrantyTestingUtils] Cleared ${testNotifications.length} test notifications`);
      }
    } catch (error) {
      console.error('[WarrantyTestingUtils] Error clearing notifications:', error);
    }
  }

  /**
   * Force service worker update (development only)
   */
  static async forceServiceWorkerUpdate(): Promise<boolean> {
    if (!this.isDevelopment) {
      console.warn('[WarrantyTestingUtils] SW update only available in development mode');
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          await registration.update();
        }

        console.log('[WarrantyTestingUtils] Service Worker update triggered');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[WarrantyTestingUtils] Error updating service worker:', error);
      return false;
    }
  }
}

// Auto-log diagnostics in development mode
if (WarrantyTestingUtils['isDevelopment']) {
  // Run diagnostics after a short delay to let the app initialize
  setTimeout(() => {
    WarrantyTestingUtils.logSystemDiagnostics();
  }, 2000);
}

// Expose testing utils to window for console access
if (WarrantyTestingUtils['isDevelopment'] && typeof window !== 'undefined') {
  (window as any).warrantyTestingUtils = WarrantyTestingUtils;
  console.log('💡 Warranty testing utils available at: window.warrantyTestingUtils');
}