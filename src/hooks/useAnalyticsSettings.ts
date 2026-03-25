import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { queryCache, cacheKeys } from '@/services/queryCache';

export function useAnalyticsSettings() {
  const { user } = useAuth();
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Use query cache with 15-minute TTL for analytics settings
        const data = await queryCache.get(
          cacheKeys.analyticsSettings(user.id),
          async () => {
            const { data, error } = await supabase
              .from('notification_settings')
              .select('analytics_enabled')
              .eq('user_id', user.id)
              .single();

            if (error) {
              // Default to enabled if no settings found or column doesn't exist
              return { analytics_enabled: true };
            }

            return data;
          },
          15 * 60 * 1000 // 15 minutes TTL
        );

        const enabled = data?.analytics_enabled ?? true;
        setAnalyticsEnabled(enabled);
      } catch (error) {
        // Default to enabled on error
        setAnalyticsEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  return { analyticsEnabled, loading };
}