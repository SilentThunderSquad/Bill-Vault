/**
 * Simple query cache to prevent duplicate API requests
 * Implements time-based TTL and request deduplication
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T = any> {
  promise: Promise<T>;
  timestamp: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache or execute fetcher function
   * Handles request deduplication and TTL expiration
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check if there's a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      // Request timeout check (30 seconds)
      if (Date.now() - pending.timestamp > 30000) {
        this.pendingRequests.delete(key);
      } else {
        return pending.promise;
      }
    }

    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Execute fetcher with deduplication
    const promise = this._executeFetcher(key, fetcher, ttl);
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  private async _executeFetcher<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      const data = await fetcher();

      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });

      return data;
    } catch (error) {
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Invalidate cache entries by pattern or specific key
   */
  invalidate(pattern: string | RegExp): void {
    if (typeof pattern === 'string') {
      // Exact match
      this.cache.delete(pattern);
      this.pendingRequests.delete(pattern);
    } else {
      // Pattern match
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
      for (const key of this.pendingRequests.keys()) {
        if (pattern.test(key)) {
          this.pendingRequests.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const queryCache = new QueryCache();

// Cache key generators for consistency
export const cacheKeys = {
  userProfile: (userId: string) => `profile:${userId}`,
  analyticsSettings: (userId: string) => `analytics:${userId}`,
  notificationSettings: (userId: string) => `notifications:${userId}`,
  bills: (userId: string, page: number = 0) => `bills:${userId}:${page}`,
  bill: (billId: string) => `bill:${billId}`,
  adminUsers: (filters: string = 'default') => `admin:users:${filters}`,
  adminBills: (filters: string = 'default') => `admin:bills:${filters}`,
  warrantyAlerts: (userId: string) => `warranty:${userId}`
} as const;