/**
 * PWA Push Notification Service for Warranty Alerts
 * Handles browser push notifications when app is in background/closed
 * Fixed version with proper service worker integration and error handling
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: {
    billId?: string;
    alertType?: string;
    url?: string;
  };
}

export class PWANotificationService {
  private static instance: PWANotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private initializeAttempted: boolean = false;
  private debugMode: boolean = !import.meta.env.PROD;

  private constructor() {
    this.permission = Notification.permission;
    this.log('PWA Notification Service created');
  }

  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService();
    }
    return PWANotificationService.instance;
  }

  /**
   * Enhanced logging for debugging
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log('[PWA Notifications]', message, ...args);
    }
  }

  private warn(message: string, ...args: unknown[]): void {
    console.warn('[PWA Notifications]', message, ...args);
  }

  private error(message: string, ...args: unknown[]): void {
    console.error('[PWA Notifications]', message, ...args);
  }

  /**
   * Check if browser supports push notifications
   */
  static isSupported(): boolean {
    const supported = (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      'PushManager' in window
    );

    if (!supported && !import.meta.env.PROD) {
      console.warn('[PWA Notifications] Browser support check failed:', {
        serviceWorker: 'serviceWorker' in navigator,
        Notification: 'Notification' in window,
        PushManager: 'PushManager' in window
      });
    }

    return supported;
  }

  /**
   * Check if push notifications are currently available for use
   */
  isAvailable(): boolean {
    const available = (
      PWANotificationService.isSupported() &&
      this.permission === 'granted' &&
      this.registration !== null
    );

    this.log('Availability check:', {
      supported: PWANotificationService.isSupported(),
      permission: this.permission,
      hasRegistration: this.registration !== null,
      available
    });

    return available;
  }

  /**
   * Request permission for push notifications with better error handling
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!PWANotificationService.isSupported()) {
      const message = 'Push notifications are not supported in this browser';
      this.error(message);
      throw new Error(message);
    }

    try {
      this.log('Requesting notification permission...');
      this.permission = await Notification.requestPermission();
      this.log('Permission result:', this.permission);

      if (this.permission === 'granted' && !this.registration) {
        // Try to initialize if we get permission but don't have registration yet
        await this.initialize();
      }

      return this.permission;
    } catch (error) {
      this.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Enhanced service worker registration with retry logic
   */
  async initialize(): Promise<void> {
    if (!PWANotificationService.isSupported()) {
      this.warn('Push notifications not supported, skipping initialization');
      return;
    }

    if (this.initializeAttempted && this.registration) {
      this.log('Already initialized');
      return;
    }

    this.initializeAttempted = true;

    try {
      this.log('Initializing PWA notification service...');

      // Wait for service worker registration with timeout
      const registrationPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Service worker registration timeout')), 10000)
      );

      this.registration = await Promise.race([registrationPromise, timeoutPromise]) as ServiceWorkerRegistration;

      this.log('Service worker registration obtained:', {
        scope: this.registration.scope,
        state: this.registration.active?.state,
        scriptURL: this.registration.active?.scriptURL
      });

      // Check if warranty handler is properly loaded
      if (this.debugMode) {
        this.checkWarrantyHandlerIntegration();
      }

      // Set up message handlers for warranty notifications
      this.setupMessageHandlers();

      // Send registration message to service worker
      if (this.registration.active) {
        this.registration.active.postMessage({
          type: 'WARRANTY_SERVICE_INITIALIZED',
          permission: this.permission,
          timestamp: new Date().toISOString()
        });
      }

      this.log('PWA Notification Service initialized successfully');
    } catch (error) {
      this.error('Failed to initialize PWA notification service:', error);
      this.registration = null;
      // Don't throw in production, just log error
      if (this.debugMode) {
        throw error;
      }
    }
  }

  /**
   * Check if warranty handlers are properly integrated (development only)
   */
  private checkWarrantyHandlerIntegration(): void {
    if (!this.debugMode) return;

    try {
      this.log('Checking warranty handler integration...');

      // Send test message to service worker to verify warranty handling
      if (this.registration?.active) {
        this.registration.active.postMessage({
          type: 'WARRANTY_INTEGRATION_CHECK',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      this.warn('Error checking warranty handler integration:', error);
    }
  }

  /**
   * Set up message handlers for service worker communication
   */
  private setupMessageHandlers(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data || {};

      switch (type) {
        case 'WARRANTY_NOTIFICATION_CLICK':
          this.log('Notification click received:', data);
          // Handle notification click navigation if needed
          break;

        case 'BACKGROUND_WARRANTY_CHECK_COMPLETED':
          this.log('Background warranty check completed:', data);
          break;

        case 'WARRANTY_INTEGRATION_CHECK_RESPONSE':
          this.log('Warranty handler integration confirmed:', data);
          break;

        default:
          break;
      }
    });

    this.log('Message handlers set up');
  }

  /**
   * Enhanced notification display with better error handling
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    this.log('Attempting to show notification:', payload);

    if (!this.isAvailable()) {
      this.warn('Notifications not available, attempting to initialize...');

      // Try to initialize if not available
      await this.initialize();

      if (!this.isAvailable()) {
        const message = 'Push notifications are not available';
        this.warn(message, {
          supported: PWANotificationService.isSupported(),
          permission: this.permission,
          hasRegistration: this.registration !== null
        });

        // In development, throw error for debugging
        if (this.debugMode) {
          throw new Error(message);
        }
        return;
      }
    }

    try {
      const notificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-192x192.png',
        tag: payload.tag || 'warranty-alert',
        requireInteraction: payload.requireInteraction || false,
        data: payload.data,
        actions: payload.data?.billId ? [
          {
            action: 'view',
            title: 'View Bill',
            icon: '/icons/icon-192x192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ] : undefined
      };

      await this.registration!.showNotification(payload.title, notificationOptions);
      this.log('Notification displayed successfully');
    } catch (error) {
      this.error('Error showing notification:', error);
      throw error;
    }
  }

  /**
   * Generate warranty alert notification payload with enhanced data
   */
  static createWarrantyNotificationPayload(
    productName: string,
    daysUntilExpiry: number,
    billId: string,
    alertType: string
  ): PushNotificationPayload {
    let title = '';
    let body = '';
    let requireInteraction = false;

    if (daysUntilExpiry < 0) {
      title = '⚠️ Warranty Expired';
      body = `${productName} warranty has expired. Consider extending or replacing.`;
      requireInteraction = true;
    } else if (daysUntilExpiry <= 1) {
      title = '🚨 Warranty Expires Soon';
      body = `${productName} warranty expires ${daysUntilExpiry === 0 ? 'today' : 'tomorrow'}!`;
      requireInteraction = true;
    } else if (daysUntilExpiry <= 7) {
      title = '⏰ Warranty Alert';
      body = `${productName} warranty expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`;
      requireInteraction = false;
    } else {
      title = '📅 Warranty Reminder';
      body = `${productName} warranty expires in ${daysUntilExpiry} days`;
      requireInteraction = false;
    }

    return {
      title,
      body,
      tag: `warranty-${billId}`,
      requireInteraction,
      data: {
        billId,
        alertType,
        url: `/bills/${billId}`,
        timestamp: new Date().toISOString(),
        daysUntilExpiry
      }
    };
  }

  /**
   * Enhanced test notification with better feedback
   */
  async testNotification(): Promise<void> {
    this.log('Testing notification system...');

    const testPayload: PushNotificationPayload = {
      title: '✅ Warranty System Test',
      body: 'Your warranty notification system is working correctly! This is a test notification.',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        alertType: 'test',
        timestamp: new Date().toISOString()
      }
    };

    try {
      await this.showNotification(testPayload);
      this.log('Test notification sent successfully');
    } catch (error) {
      this.error('Test notification failed:', error);
      throw error;
    }
  }

  /**
   * Clear warranty notifications with better error handling
   */
  async clearWarrantyNotifications(): Promise<void> {
    if (!this.registration) {
      this.warn('No service worker registration, cannot clear notifications');
      return;
    }

    try {
      const notifications = await this.registration.getNotifications({ tag: 'warranty-alert' });
      notifications.forEach(notification => notification.close());

      this.log(`Cleared ${notifications.length} warranty notifications`);

      // Also send message to service worker
      if (this.registration.active) {
        this.registration.active.postMessage({
          type: 'WARRANTY_CLEAR_NOTIFICATIONS'
        });
      }
    } catch (error) {
      this.error('Error clearing notifications:', error);
      throw error;
    }
  }

  /**
   * Get system status for debugging
   */
  getStatus(): {
    supported: boolean;
    permission: NotificationPermission;
    hasRegistration: boolean;
    available: boolean;
    initialized: boolean;
  } {
    return {
      supported: PWANotificationService.isSupported(),
      permission: this.permission,
      hasRegistration: this.registration !== null,
      available: this.isAvailable(),
      initialized: this.initializeAttempted
    };
  }

  /**
   * Force reinitialization (useful for development)
   */
  async forceReinitialize(): Promise<void> {
    this.log('Force reinitializing...');
    this.registration = null;
    this.initializeAttempted = false;
    await this.initialize();
  }
}

// Export singleton instance
export const pwaNotificationService = PWANotificationService.getInstance();

// Auto-initialize when module loads (with error handling)
if (typeof window !== 'undefined') {
  // Initialize after a short delay to let the app boot up
  setTimeout(() => {
    pwaNotificationService.initialize().catch(error => {
      console.warn('[PWA Notifications] Auto-initialization failed:', error);
    });
  }, 1000);
}