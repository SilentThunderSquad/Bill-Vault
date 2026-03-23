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
  last_login_at: string | null;
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

      // Get the admin user overview data with enhanced query
      const { data: adminData, error: usersError } = await supabase
        .from('admin_user_overview')
        .select(`
          *,
          user_profiles!inner(
            avatar_url,
            provider,
            social_login_provider
          )
        `)
        .order('signup_date', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Fallback to basic query if enhanced query fails
        const { data: basicData, error: basicError } = await supabase
          .from('admin_user_overview')
          .select('*')
          .order('signup_date', { ascending: false });

        if (basicError) {
          throw basicError;
        }

        // Process users with fallback provider detection
        const processedUsers = (basicData || []).map(user => ({
          ...user,
          provider: detectProviderFromEmail(user.email),
          avatar_url: null
        }));

        setUsers(processedUsers);
        return;
      }

      // Process users with available data
      const processedUsers = (adminData || []).map(user => ({
        ...user,
        provider: user.user_profiles?.social_login_provider ||
                 user.user_profiles?.provider ||
                 detectProviderFromEmail(user.email),
        avatar_url: user.user_profiles?.avatar_url || null
      }));

      setUsers(processedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to detect provider from email patterns
  const detectProviderFromEmail = (email: string): string => {
    if (!email) return 'email';

    // Common patterns for detecting social providers
    const domain = email.split('@')[1]?.toLowerCase();

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      return 'google';
    }

    // For GitHub, users might use any email but we can't detect from email alone
    // Most non-Gmail emails will be considered email/password
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

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.full_name || user.email.split('@')[0]}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.country && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{user.country}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          getStatusColor(user.activity_status)
                        )}>
                          {user.activity_status}
                        </span>
                        {user.role && user.role !== 'user' && (
                          <span className="block mt-1 text-xs text-accent">
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {user.total_bills || 0}
                          </span>
                        </div>
                        {user.total_spent && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ${user.total_spent.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {formatBytes(user.storage_used_bytes)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.last_login_at ? (
                          <div>
                            <p className="text-sm text-foreground">
                              {new Date(user.last_login_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(user.last_login_at).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-1 hover:bg-accent/20 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-accent" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={actionLoading === user.id}
                            className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Suspend User"
                          >
                            <UserX className="h-4 w-4 text-muted-foreground hover:text-yellow-500" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            disabled={actionLoading === user.id}
                            className="p-1 hover:bg-destructive/20 rounded transition-colors"
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
        )}
      </div>

      {/* User Detail Modal (placeholder) */}
      {showUserModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {/* User Avatar */}
              {selectedUser.avatar_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || 'User Avatar'}
                    className="w-16 h-16 rounded-full border border-border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-foreground">{selectedUser.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="text-foreground">{selectedUser.country || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(selectedUser.activity_status)
                  )}>
                    {selectedUser.activity_status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Login Provider</label>
                  <div className="flex items-center gap-2">
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
                  <p className="text-foreground">{selectedUser.total_bills || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Storage Used</label>
                  <p className="text-foreground">{formatBytes(selectedUser.storage_used_bytes)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                  <p className="text-foreground">${(selectedUser.total_spent || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Signup Date</label>
                  <p className="text-foreground">{new Date(selectedUser.signup_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                  <p className="text-foreground">
                    {selectedUser.last_login_at
                      ? new Date(selectedUser.last_login_at).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Confirmed</label>
                  <p className="text-foreground">
                    {selectedUser.email_confirmed_at
                      ? new Date(selectedUser.email_confirmed_at).toLocaleDateString()
                      : 'Not confirmed'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}