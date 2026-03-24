import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Activity
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  signup_date: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  country: string | null;
  role: string | null;
  total_bills: number | null;
  storage_used_bytes: number | null;
  total_spent: number | null;
  activity_status: 'active' | 'inactive' | 'dormant';
  provider?: string | null;
  avatar_url?: string | null;
}

interface UsersFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'dormant';
  role: 'all' | 'user' | 'admin';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UsersFilters>({
    search: '',
    status: 'all',
    role: 'all'
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the basic admin user overview data
      const { data: adminData, error: usersError } = await supabase
        .from('admin_user_overview')
        .select('*')
        .order('signup_date', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      if (!adminData || adminData.length === 0) {
        setUsers([]);
        return;
      }

      // Then, get profile data separately to avoid complex joins
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, avatar_url, provider, social_login_provider')
        .in('user_id', adminData.map(user => user.id));

      // Create lookup map for profiles
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // Process users with enhanced provider detection
      const processedUsers = adminData.map(user => {
        const profile = profilesMap.get(user.id);

        // Enhanced provider detection logic
        let provider = profile?.social_login_provider || profile?.provider;

        // If no provider is set, try to detect from email and other clues
        if (!provider || provider === 'email') {
          provider = detectProviderFromEmail(user.email);
        }

        return {
          ...user,
          provider: provider,
          avatar_url: profile?.avatar_url || null
        };
      });

      setUsers(processedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced helper function to detect provider from email patterns and other clues
  const detectProviderFromEmail = (email: string): string => {
    if (!email) return 'email';

    // Get the domain from email
    const domain = email.split('@')[1]?.toLowerCase();

    // Google domains
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      return 'google';
    }

    // Common corporate/business domains that might indicate email signup
    const emailDomains = [
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com', // Microsoft
      'yahoo.com', 'ymail.com', 'rocketmail.com', // Yahoo
      'icloud.com', 'me.com', 'mac.com', // Apple
      'protonmail.com', 'proton.me', // Proton
      'aol.com', 'aim.com', // AOL
    ];

    // Corporate/custom domains (contain company names or are not common providers)
    const commonProviderDomains = [
      'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com',
      'yahoo.com', 'icloud.com', 'protonmail.com'
    ];

    // If it's a well-known email provider, likely email/password signup
    if (emailDomains.includes(domain) || !commonProviderDomains.includes(domain)) {
      return 'email';
    }

    // Default fallback
    return 'email';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' || user.activity_status === filters.status;
    const matchesRole = filters.role === 'all' || user.role === filters.role;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      setActionLoading(userId);
      const currentUser = (await supabase.auth.getUser()).data.user;

      switch (action) {
        case 'suspend':
          // Update user status to suspended
          const { error: suspendError } = await supabase
            .rpc('admin_suspend_user', {
              target_user_id: userId,
              admin_user_id: currentUser?.id,
              reason: 'Administrative action'
            });

          if (suspendError) {
            // Fallback to direct update if RPC doesn't exist
            await supabase
              .from('user_profiles')
              .update({ status: 'suspended' })
              .eq('user_id', userId);
          }

          setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, activity_status: 'inactive' } : u
          ));
          toast.success('User suspended successfully');
          break;

        case 'activate':
          // Update user status to active
          const { error: activateError } = await supabase
            .rpc('admin_activate_user', {
              target_user_id: userId,
              admin_user_id: currentUser?.id
            });

          if (activateError) {
            // Fallback to direct update if RPC doesn't exist
            await supabase
              .from('user_profiles')
              .update({ status: 'active' })
              .eq('user_id', userId);
          }

          setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, activity_status: 'active' } : u
          ));
          toast.success('User activated successfully');
          break;

        case 'delete':
          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their data.')) {
            // Call admin delete user RPC function
            const { error: deleteError } = await supabase
              .rpc('admin_delete_user', {
                target_user_id: userId,
                admin_user_id: currentUser?.id
              });

            if (deleteError) {
              // Fallback to soft delete if RPC doesn't exist
              await supabase
                .from('user_profiles')
                .update({
                  status: 'deleted',
                  deleted_at: new Date().toISOString()
                })
                .eq('user_id', userId);

              toast.warning('User marked for deletion. Complete removal requires database admin access.');
            } else {
              toast.success('User and all associated data deleted successfully');
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
          }
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '0 MB';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'dormant': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage all user accounts and their data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="dormant">Dormant</option>
          </select>

          {/* Role filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
            <button
              onClick={loadUsers}
              className="ml-auto text-sm text-accent hover:text-accent/80"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Users Table/Cards */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block table-responsive">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-2/5 min-w-[200px]" />
                  <col className="w-[110px]" />
                  <col className="w-[90px]" />
                  <col className="w-[100px]" />
                  <col className="w-[120px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bills</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Storage</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        {filters.search || filters.status !== 'all' || filters.role !== 'all'
                          ? 'No users match your filters'
                          : 'No users found'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="cell-content gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                              <Users className="h-5 w-5 text-accent" />
                            </div>
                            <div className="cell-text">
                              <p className="font-medium text-foreground text-truncate w-truncate-md"
                                 title={user.full_name || user.email}>
                                {user.full_name || user.email.split('@')[0]}
                              </p>
                              <p className="text-sm text-muted-foreground text-truncate w-truncate-lg"
                                 title={user.email}>{user.email}</p>
                              {user.country && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs text-muted-foreground text-truncate">{user.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-2">
                            <div className="cell-text">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0',
                                  getStatusColor(user.activity_status)
                                )}>
                                  {user.activity_status}
                                </span>
                              </div>
                              {user.role && user.role !== 'user' && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"></div>
                                  <span className="text-xs font-medium text-accent capitalize text-truncate">
                                    {user.role}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="cell-text">
                              <span className="text-sm text-foreground">
                                {user.total_bills || 0}
                              </span>
                              {user.total_spent && (
                                <p className="text-xs text-muted-foreground mt-1 text-truncate">
                                  ${user.total_spent.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground text-truncate">
                            {formatBytes(user.storage_used_bytes)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.last_sign_in_at ? (
                            <div className="cell-text">
                              <p className="text-sm text-foreground text-truncate">
                                {new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground text-truncate">
                                {new Date(user.last_sign_in_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="action-buttons">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="hover:bg-accent/20 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-accent" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              disabled={actionLoading === user.id}
                              className="hover:bg-yellow-500/20 rounded transition-colors"
                              title="Suspend User"
                            >
                              <UserX className="h-4 w-4 text-muted-foreground hover:text-yellow-500" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              disabled={actionLoading === user.id}
                              className="hover:bg-destructive/20 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>
                    {filters.search || filters.status !== 'all' || filters.role !== 'all'
                      ? 'No users match your filters'
                      : 'No users found'
                    }
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background border border-border rounded-lg p-4 space-y-3"
                  >
                    {/* User Info Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                          <Users className="h-6 w-6 text-accent" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground truncate">
                            {user.full_name || user.email.split('@')[0]}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          {user.country && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{user.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border shrink-0',
                        getStatusColor(user.activity_status)
                      )}>
                        {user.activity_status}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 py-3 border-t border-border">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{user.total_bills || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Bills</p>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium">{formatBytes(user.storage_used_bytes)}</span>
                        <p className="text-xs text-muted-foreground mt-1">Storage</p>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Last Login</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'suspend')}
                        disabled={actionLoading === user.id}
                        className="p-2 hover:bg-yellow-500/20 text-yellow-600 rounded-lg transition-colors"
                        title="Suspend User"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        disabled={actionLoading === user.id}
                        className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* User Detail Modal - Mobile Optimized */}
      {showUserModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 md:flex md:items-center md:justify-center md:p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: "100%" }}
            animate={{ scale: 1, y: 0 }}
            className={cn(
              "bg-card border border-border overflow-auto",
              // Mobile: full screen
              "md:rounded-lg md:max-w-2xl md:w-full md:max-h-[80vh]",
              // Mobile: full screen
              "h-[100dvh] w-full md:h-auto"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors touch-manipulation"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 space-y-6">
              {/* User Avatar */}
              {selectedUser.avatar_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || 'User Avatar'}
                    className="w-20 h-20 rounded-full border border-border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-foreground mt-1">{selectedUser.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground mt-1 break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="text-foreground mt-1">{selectedUser.country || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1',
                    getStatusColor(selectedUser.activity_status)
                  )}>
                    {selectedUser.activity_status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Login Provider</label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.provider === 'google' && (
                      <>
                        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-foreground">Google</span>
                      </>
                    )}
                    {selectedUser.provider === 'github' && (
                      <>
                        <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <span className="text-foreground">GitHub</span>
                      </>
                    )}
                    {selectedUser.provider === 'email' && (
                      <>
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                          <Mail className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-foreground">Email/Password</span>
                      </>
                    )}
                    {selectedUser.provider && !['google', 'github', 'email'].includes(selectedUser.provider) && (
                      <>
                        <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
                          <span className="text-accent-foreground text-xs font-bold">{selectedUser.provider.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-foreground capitalize">{selectedUser.provider}</span>
                      </>
                    )}
                    {!selectedUser.provider && (
                      <>
                        <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">?</span>
                        </div>
                        <span className="text-muted-foreground">Unknown</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Bills</label>
                  <p className="text-foreground mt-1">{selectedUser.total_bills || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Storage Used</label>
                  <p className="text-foreground mt-1">{formatBytes(selectedUser.storage_used_bytes)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                  <p className="text-foreground mt-1">${(selectedUser.total_spent || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Signup Date</label>
                  <p className="text-foreground mt-1">{new Date(selectedUser.signup_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <p className="text-foreground mt-1">
                    {selectedUser.last_sign_in_at
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Confirmed</label>
                  <p className="text-foreground mt-1">
                    {selectedUser.email_confirmed_at
                      ? new Date(selectedUser.email_confirmed_at).toLocaleDateString()
                      : 'Not confirmed'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                  disabled={actionLoading === selectedUser.id}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-500/10 text-yellow-600 rounded-lg font-medium hover:bg-yellow-500/20 transition-colors touch-manipulation"
                >
                  <UserX className="h-4 w-4" />
                  Suspend User
                </button>
                <button
                  onClick={() => handleUserAction(selectedUser.id, 'delete')}
                  disabled={actionLoading === selectedUser.id}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors touch-manipulation"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </button>
              </div>
            </div>

            {/* Safe area bottom padding on mobile */}
            <div className="h-8 md:hidden" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}