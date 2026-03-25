import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useActivity } from '@/hooks/useActivity';
import { supabase } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Camera, Save, Loader2, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatActivityTime, getActivityIcon } from '@/services/activityTracker';
import type { UserProfile } from '@/types';
import { sanitizePhoneNumber } from '@/utils/security';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other',
];

export default function Profile() {
  const { user } = useAuth();
  const { activities, loading: activitiesLoading, logActivity, helpers } = useActivity();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    mobileNumber: '',
    country: 'India',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoadingProfile(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create new profile
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id, full_name: '' })
          .select()
          .single();
        if (newProfile) {
          setProfile(newProfile);
          setProfileForm({
            fullName: newProfile.full_name || '',
            mobileNumber: newProfile.mobile_number || '',
            country: newProfile.country || 'India',
          });
          // Only set avatarUrl if we have a valid custom avatar from database
          if (newProfile.avatar_url && newProfile.avatar_url.trim() && newProfile.avatar_url.startsWith('http')) {
            setAvatarUrl(newProfile.avatar_url);
          }
        }
      } else if (data) {
        setProfile(data);
        setProfileForm({
          fullName: data.full_name || '',
          mobileNumber: data.mobile_number || '',
          country: data.country || 'India',
        });
        // Only set avatarUrl if we have a valid custom avatar from database
        if (data.avatar_url && data.avatar_url.trim() && data.avatar_url.startsWith('http')) {
          setAvatarUrl(data.avatar_url);
        }
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.fullName.trim(),
          mobile_number: profileForm.mobileNumber || null,
          country: profileForm.country,
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        // Log activity
        await logActivity(helpers.profileUpdated(profile.id));
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar files
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await supabase
        .from('user_profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
      toast.success('Profile picture updated');

      // Log activity
      if (profile) {
        await logActivity(helpers.profileUpdated(profile.id));
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Get the appropriate avatar URL - custom avatar takes priority, then Google photo, then fallback
  const getAvatarUrl = () => {
    // Check if we have a custom uploaded avatar and it's a valid URL
    if (avatarUrl && avatarUrl.trim() && avatarUrl.startsWith('http')) {
      // Don't use database-stored Google URLs that might have CORS issues
      if (!avatarUrl.includes('googleusercontent.com')) {
        return avatarUrl;
      }
    }

    // Check profile data from database for custom avatar (but not Google URLs)
    if (profile?.avatar_url && profile.avatar_url.trim() && profile.avatar_url.startsWith('http') && !profile.avatar_url.includes('googleusercontent.com')) {
      return profile.avatar_url;
    }

    // Always use fresh Google profile images from user metadata
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }

    return null;
  };

  const currentAvatarUrl = getAvatarUrl();
  const displayName = profileForm.fullName || user?.email?.split('@')[0] || 'User';

  // Reset image error when URL changes
  useEffect(() => {
    setImageLoadError(false);
    setRetryCount(0);
  }, [currentAvatarUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your personal information and view your activity
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingProfile ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <>
                {/* Avatar Section */}
                {/* Mobile Layout - Vertical centered */}
                <div className="block sm:hidden space-y-4">
                  {/* Profile Image - Centered in first row */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                        {currentAvatarUrl && !imageLoadError ? (
                          <img
                            src={currentAvatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              setImageLoadError(false);
                            }}
                            onError={() => {
                              if (retryCount < 2 && currentAvatarUrl?.includes('googleusercontent.com')) {
                                // Retry Google images with a slight delay
                                setTimeout(() => {
                                  setRetryCount(prev => prev + 1);
                                  setImageLoadError(false);
                                }, 1000 * (retryCount + 1));
                              } else {
                                setImageLoadError(true);
                              }
                            }}
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-1 -right-1 p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50"
                        aria-label="Upload profile picture"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Profile Details - Full width second row onwards */}
                  <div className="space-y-3 text-center">
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-foreground break-words leading-tight">
                        {displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground break-all leading-relaxed px-4">
                        {user?.email}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="break-words">
                          Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          }) : 'N/A'}
                        </span>
                      </div>

                      {profileForm.country && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="break-words">{profileForm.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Side by side (original design) */}
                <div className="hidden sm:flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                      {currentAvatarUrl && !imageLoadError ? (
                        <img
                          src={currentAvatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            setImageLoadError(false);
                          }}
                          onError={() => {
                            if (retryCount < 2 && currentAvatarUrl?.includes('googleusercontent.com')) {
                              // Retry Google images with a slight delay
                              setTimeout(() => {
                                setRetryCount(prev => prev + 1);
                                setImageLoadError(false);
                              }, 1000 * (retryCount + 1));
                            } else {
                              setImageLoadError(true);
                            }
                          }}
                        />
                      ) : (
                        <User className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50"
                      aria-label="Upload profile picture"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        }) : 'N/A'}
                      </div>

                      {profileForm.country && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {profileForm.country}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="mobile"
                        value={profileForm.mobileNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: sanitizePhoneNumber(e.target.value) })}
                        placeholder="+1 234 567 8900"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select
                        id="country"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 8).map((activity) => {
                  const { icon, color } = getActivityIcon(activity.activity_type as any);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={cn('text-lg shrink-0', color)}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.activity_title}
                        </p>
                        {activity.activity_description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {activity.activity_description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatActivityTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}