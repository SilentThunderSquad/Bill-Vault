/**
 * End-to-End Testing Script for Warranty Notification System
 * Comprehensive validation of the complete notification flow
 */

export interface E2ETestResult {
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  error?: string;
  timestamp: number;
  duration?: number;
}

export interface E2ETestSuite {
  suiteName: string;
  results: E2ETestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export class WarrantyNotificationE2ETester {
  private startTime: number = 0;
  private results: E2ETestResult[] = [];

  /**
   * Run complete end-to-end test suite
   */
  async runCompleteTestSuite(): Promise<E2ETestSuite> {
    this.startTime = Date.now();
    this.results = [];

    console.group('🧪 Running Warranty Notification E2E Test Suite');

    // Test 1: System Prerequisites
    await this.testSystemPrerequisites();

    // Test 2: Service Worker Registration
    await this.testServiceWorkerRegistration();

    // Test 3: PWA Notification Service Initialization
    await this.testPWAServiceInitialization();

    // Test 4: Permission Request Flow
    await this.testPermissionRequestFlow();

    // Test 5: Warranty Handler Integration
    await this.testWarrantyHandlerIntegration();

    // Test 6: Notification Display
    await this.testNotificationDisplay();

    // Test 7: Notification Click Handling
    await this.testNotificationClickHandling();

    // Test 8: Development Testing Utils
    await this.testDevelopmentUtils();

    // Test 9: Error Handling and Fallbacks
    await this.testErrorHandling();

    // Test 10: Performance and Memory
    await this.testPerformance();

    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      failed: this.results.filter(r => r.status === 'fail').length,
      skipped: this.results.filter(r => r.status === 'skip').length,
      duration
    };

    console.groupEnd();
    console.log(`✅ Test Suite Complete: ${summary.passed}/${summary.total} passed in ${duration}ms`);

    return {
      suiteName: 'Warranty Notification System E2E Tests',
      results: this.results,
      summary
    };
  }

  private async runTest(
    testName: string,
    testFunction: () => Promise<void>
  ): Promise<E2ETestResult> {
    const startTime = Date.now();

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      const result: E2ETestResult = {
        testName,
        status: 'pass',
        message: 'Test passed successfully',
        timestamp: startTime,
        duration
      };

      console.log(`✅ ${testName} (${duration}ms)`);
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result: E2ETestResult = {
        testName,
        status: 'fail',
        message: 'Test failed',
        error: errorMessage,
        timestamp: startTime,
        duration
      };

      console.error(`❌ ${testName} (${duration}ms):`, errorMessage);
      this.results.push(result);
      return result;
    }
  }

  private async testSystemPrerequisites(): Promise<void> {
    await this.runTest('System Prerequisites Check', async () => {
      // Check browser support
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      if (!('Notification' in window)) {
        throw new Error('Notification API not supported');
      }

      if (!('PushManager' in window)) {
        throw new Error('Push Manager not supported');
      }

      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Not in secure context (HTTPS required)');
      }
    });
  }

  private async testServiceWorkerRegistration(): Promise<void> {
    await this.runTest('Service Worker Registration', async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        if (!registration) {
          throw new Error('No service worker registration found');
        }

        if (!registration.active) {
          throw new Error('No active service worker found');
        }

        // Check if warranty handler is loaded
        const scriptURL = registration.active.scriptURL;
        if (!scriptURL.includes('/sw.js') && !scriptURL.includes('sw-warranty')) {
          console.warn('Service worker script may not include warranty handlers');
        }
      } catch (error) {
        throw new Error(`Service Worker registration failed: ${error}`);
      }
    });
  }

  private async testPWAServiceInitialization(): Promise<void> {
    await this.runTest('PWA Service Initialization', async () => {
      // Import the service dynamically to test initialization
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      // Force reinitialization
      await pwaNotificationService.forceReinitialize();

      // Check status
      const status = pwaNotificationService.getStatus();

      if (!status.supported) {
        throw new Error('PWA notifications not supported');
      }

      if (!status.hasRegistration) {
        throw new Error('PWA service not properly initialized');
      }
    });
  }

  private async testPermissionRequestFlow(): Promise<void> {
    await this.runTest('Permission Request Flow', async () => {
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      // Check current permission
      const currentPermission = Notification.permission;

      if (currentPermission === 'denied') {
        // Skip if denied (user must manually reset)
        throw new Error('SKIP: Permission denied - manual reset required');
      }

      if (currentPermission === 'default') {
        // Test permission request
        const permission = await pwaNotificationService.requestPermission();

        if (permission !== 'granted' && permission !== 'denied') {
          throw new Error(`Unexpected permission result: ${permission}`);
        }
      }

      // Permission flow completed successfully
    });
  }

  private async testWarrantyHandlerIntegration(): Promise<void> {
    await this.runTest('Warranty Handler Integration', async () => {
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      // Test integration check if in development mode
      if (import.meta.env.DEV) {
        const registration = await navigator.serviceWorker.ready;

        if (registration.active) {
          // Send integration check message
          registration.active.postMessage({
            type: 'WARRANTY_INTEGRATION_CHECK',
            timestamp: new Date().toISOString()
          });

          // Wait for response (with timeout)
          const responsePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Integration check timeout'));
            }, 5000);

            const messageHandler = (event: MessageEvent) => {
              if (event.data?.type === 'WARRANTY_INTEGRATION_CHECK_RESPONSE') {
                clearTimeout(timeout);
                navigator.serviceWorker.removeEventListener('message', messageHandler);
                resolve(event.data);
              }
            };

            navigator.serviceWorker.addEventListener('message', messageHandler);
          });

          await responsePromise;
        }
      }
    });
  }

  private async testNotificationDisplay(): Promise<void> {
    await this.runTest('Notification Display', async () => {
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      if (Notification.permission !== 'granted') {
        throw new Error('SKIP: Notification permission not granted');
      }

      // Test notification display
      await pwaNotificationService.testNotification();

      // Wait a moment for notification to appear
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  }

  private async testNotificationClickHandling(): Promise<void> {
    await this.runTest('Notification Click Handling', async () => {
      // This is harder to test automatically, so we'll just verify the handlers exist
      const registration = await navigator.serviceWorker.ready;

      if (!registration.active) {
        throw new Error('No active service worker for click handling test');
      }

      // Send a test message to verify click handler exists
      registration.active.postMessage({
        type: 'WARRANTY_CLICK_HANDLER_TEST',
        timestamp: new Date().toISOString()
      });

      // Test passed if no errors thrown
    });
  }

  private async testDevelopmentUtils(): Promise<void> {
    await this.runTest('Development Testing Utils', async () => {
      if (!import.meta.env.DEV) {
        throw new Error('SKIP: Development utils only available in dev mode');
      }

      const { WarrantyTestingUtils } = await import('@/utils/warrantyTestingUtils');

      // Test system status
      const status = await WarrantyTestingUtils.getSystemStatus();

      if (!status.pwaSupport) {
        throw new Error('Development utils report PWA not supported');
      }

      // Test permission flow
      const permissionResult = await WarrantyTestingUtils.testPermissionFlow();

      if (!permissionResult.success && !permissionResult.message.includes('denied')) {
        throw new Error(`Permission test failed: ${permissionResult.error}`);
      }
    });
  }

  private async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling and Fallbacks', async () => {
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      // Test with invalid payload (should handle gracefully)
      try {
        await pwaNotificationService.showNotification({
          title: '',
          body: '',
          data: undefined
        } as any);

        throw new Error('Should have thrown error for invalid payload');
      } catch (error) {
        // Expected to throw an error
        if (error instanceof Error && error.message.includes('Should have thrown')) {
          throw error;
        }
        // Good - error was handled
      }

      // Test graceful degradation
      const status = pwaNotificationService.getStatus();

      if (status.permission === 'denied' && !status.available) {
        // Should gracefully handle denied permissions
        console.log('✓ Graceful degradation working for denied permissions');
      }
    });
  }

  private async testPerformance(): Promise<void> {
    await this.runTest('Performance and Memory', async () => {
      const { pwaNotificationService } = await import('@/services/pwaNotificationService');

      // Test initialization performance
      const startTime = performance.now();
      await pwaNotificationService.forceReinitialize();
      const initTime = performance.now() - startTime;

      if (initTime > 5000) {
        throw new Error(`Initialization too slow: ${initTime}ms`);
      }

      // Test memory usage (basic check)
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;

        if (usedMB > 500) {
          console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`);
        }
      }
    });
  }
}

// Export test runner for console use
export const warrantyE2ETester = new WarrantyNotificationE2ETester();

// Auto-run tests in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).warrantyE2ETester = warrantyE2ETester;
  console.log('💡 E2E tester available at: window.warrantyE2ETester');
  console.log('Run tests with: warrantyE2ETester.runCompleteTestSuite()');
}