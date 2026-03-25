import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { queryCache, cacheKeys } from '@/services/queryCache';
import type { UserProfile } from '@/types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Use query cache with 10-minute TTL for user profile
      const data = await queryCache.get(
        cacheKeys.userProfile(user.id),
        async () => {
          const { data, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: newProfile, error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                full_name: user.user_metadata?.full_name || '',
              })
              .select()
              .single();

            if (insertError) throw insertError;
            return newProfile;
          } else if (fetchError) {
            throw fetchError;
          }

          return data;
        },
        10 * 60 * 1000 // 10 minutes TTL
      );

      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Invalidate cache and update local state
    queryCache.invalidate(cacheKeys.userProfile(user.id));
    setProfile(data);
    return data;
  }, [user]);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Delete existing avatar if any
    await supabase.storage.from('avatars').remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, fetchProfile, updateProfile, uploadAvatar };
}
