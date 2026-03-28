/**
 * Warranty Notification Handler for Main Service Worker
 * This module is imported into the main vite-generated service worker
 * to provide warranty notification functionality
 */

// ====================================================================================
// WARRANTY NOTIFICATION HANDLING
// ====================================================================================

/**
 * Handle notification clicks with proper navigation
 */
function handleWarrantyNotificationClick(event) {
  console.log('[WARRANTY SW] Notification click received:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === 'view' && data.url) {
    // Open the specific bill page
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window with the same URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(data.url) && 'focus' in client) {
              return client.focus();
            }
          }

          // Check if app is already open
          const appClient = clientList.find(client =>
            client.url.includes(self.registration.scope)
          );

          if (appClient && 'focus' in appClient) {
            // Navigate existing window
            appClient.focus();
            return appClient.postMessage({
              type: 'NAVIGATE_TO_BILL',
              billId: data.billId,
              url: data.url
            });
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(data.url);
          }
        })
    );
  } else if (action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('[WARRANTY SW] Notification dismissed');
  } else {
    // Default click behavior - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window
          if (clientList.length > 0) {
            return clientList[0].focus();
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
    );
  }

  // Send message to client about the click
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true })
      .then((clientList) => {
        clientList.forEach(client => {
          client.postMessage({
            type: 'WARRANTY_NOTIFICATION_CLICK',
            action,
            data
          });
        });
      })
  );
}

/**
 * Handle push events for warranty notifications
 */
function handleWarrantyPushEvent(event) {
  console.log('[WARRANTY SW] Push event received:', event);

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    // Only handle warranty-related push notifications
    if (!data.type || !data.type.includes('warranty')) {
      return;
    }

    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'warranty-alert',
      requireInteraction: data.requireInteraction || false,
      data: data.data,
      vibrate: [200, 100, 200],
      actions: data.data?.billId ? [
        {
          action: 'view',
          title: 'View Bill',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ] : []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[WARRANTY SW] Error handling push event:', error);
  }
}

/**
 * Background sync for warranty checks (experimental)
 */
function handleWarrantyBackgroundSync(event) {
  if (event.tag === 'warranty-check') {
    console.log('[WARRANTY SW] Background warranty check triggered');

    event.waitUntil(
      performBackgroundWarrantyCheck()
        .then(() => {
          console.log('[WARRANTY SW] Background warranty check completed');
        })
        .catch((error) => {
          console.error('[WARRANTY SW] Background warranty check failed:', error);
        })
    );
  }
}

/**
 * Perform background warranty check
 */
async function performBackgroundWarrantyCheck() {
  try {
    // For now, we'll just log that the check happened
    // In a real implementation, you would:
    // 1. Get user ID from IndexedDB or other storage
    // 2. Check warranties against current date
    // 3. Generate notifications if needed
    console.log('[WARRANTY SW] Performing background warranty check...');

    // Send message to main app if it's open
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_WARRANTY_CHECK_COMPLETED',
        timestamp: new Date().toISOString()
      });
    });

    return true;
  } catch (error) {
    console.error('[WARRANTY SW] Error in background warranty check:', error);
    throw error;
  }
}

/**
 * Handle messages from main app
 */
function handleWarrantyMessages(event) {
  const { type, data } = event.data || {};

  switch (type) {
    case 'WARRANTY_REGISTER_USER':
      // Store user ID for background checks
      console.log('[WARRANTY SW] User registered for warranty notifications:', data?.userId);
      // In a real implementation, store this in IndexedDB
      break;

    case 'WARRANTY_CHECK_NOW':
      // Trigger immediate warranty check
      console.log('[WARRANTY SW] Immediate warranty check requested');
      event.waitUntil(performBackgroundWarrantyCheck());
      break;

    case 'WARRANTY_CLEAR_NOTIFICATIONS':
      // Clear all warranty notifications
      console.log('[WARRANTY SW] Clearing warranty notifications');
      event.waitUntil(clearWarrantyNotifications());
      break;

    case 'WARRANTY_INTEGRATION_CHECK':
      // Respond to integration check (development only)
      console.log('[WARRANTY SW] Integration check received');
      event.source?.postMessage({
        type: 'WARRANTY_INTEGRATION_CHECK_RESPONSE',
        data: {
          status: 'active',
          timestamp: new Date().toISOString(),
          handlersLoaded: true
        }
      });
      break;

    default:
      break;
  }
}

/**
 * Clear all warranty notifications
 */
async function clearWarrantyNotifications() {
  try {
    const notifications = await self.registration.getNotifications({
      tag: 'warranty-alert'
    });

    notifications.forEach(notification => {
      notification.close();
    });

    console.log(`[WARRANTY SW] Cleared ${notifications.length} warranty notifications`);
  } catch (error) {
    console.error('[WARRANTY SW] Error clearing notifications:', error);
  }
}

// ====================================================================================
// EXPORT HANDLERS FOR MAIN SERVICE WORKER
// ====================================================================================

// Export handlers so they can be imported into the main service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleWarrantyNotificationClick,
    handleWarrantyPushEvent,
    handleWarrantyBackgroundSync,
    handleWarrantyMessages,
    clearWarrantyNotifications,
    performBackgroundWarrantyCheck
  };
}

// If running in service worker context, set up event listeners
if (typeof importScripts === 'function') {
  // This is running in a service worker

  // Add notification click handler
  self.addEventListener('notificationclick', (event) => {
    // Check if this is a warranty notification
    if (event.notification.tag && event.notification.tag.startsWith('warranty-')) {
      handleWarrantyNotificationClick(event);
    }
  });

  // Add push event handler
  self.addEventListener('push', (event) => {
    handleWarrantyPushEvent(event);
  });

  // Add background sync handler
  self.addEventListener('sync', (event) => {
    handleWarrantyBackgroundSync(event);
  });

  // Add message handler
  self.addEventListener('message', (event) => {
    handleWarrantyMessages(event);
  });

  console.log('[WARRANTY SW] Warranty notification handlers registered');
}