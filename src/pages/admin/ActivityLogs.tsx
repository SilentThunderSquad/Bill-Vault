import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Shield,
  LogIn,
  LogOut,
  Settings,
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Download,
  Eye
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Additional fields for compatibility with UI
  user_id?: string | null;
  user_email?: string | null;
  user_full_name?: string | null;
  severity?: string;
  timestamp?: string;
  session_id?: string | null;
}

interface ActivityFilters {
  search: string;
  action: string;
  resourceType: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  adminId: string;
  severity: string;
  userId: string;
}

const actionTypes = [
  'admin.user_suspend',
  'admin.user_activate',
  'admin.user_delete',
  'admin.bill_delete',
  'admin.bill_archive',
  'admin.settings_update',
  'admin.login',
  'admin.logout',
  'system.backup',
  'system.error'
];

const resourceTypes = [
  'user',
  'bill',
  'admin',
  'system'
];

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    action: 'all',
    resourceType: 'all',
    dateRange: 'all',
    adminId: '',
    severity: 'all',
    userId: ''
  });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: logsError } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (logsError) {
        throw logsError;
      }

      setLogs(data || []);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError('Failed to load activity logs');

      // Use mock data for development if database query fails
      const mockLogs = [
        {
          id: '1',
          admin_id: 'admin-1',
          action: 'admin.login',
          resource_type: 'admin',
          resource_id: null,
          details: { ip: '192.168.1.1' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          admin_id: 'admin-1',
          action: 'admin.user_suspend',
          resource_type: 'user',
          resource_id: 'user-123',
          details: { reason: 'Terms violation' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        return now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    // Search filter
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !searchTerm ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.resource_type.toLowerCase().includes(searchTerm) ||
      log.admin_id.toLowerCase().includes(searchTerm) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm);

    // Action filter
    const matchesAction = filters.action === 'all' || log.action === filters.action;

    // Resource type filter
    const matchesResourceType = filters.resourceType === 'all' || log.resource_type === filters.resourceType;

    // Date range filter
    const dateRangeFilter = getDateRangeFilter();
    const logDate = log.timestamp || log.created_at;
    const matchesDateRange = !dateRangeFilter ||
      (filters.dateRange === 'today'
        ? new Date(logDate).toDateString() === dateRangeFilter
        : new Date(logDate) >= new Date(dateRangeFilter));

    // Admin filter
    const matchesAdmin = !filters.adminId || log.admin_id === filters.adminId;

    // Severity filter
    const matchesSeverity = filters.severity === 'all' || (log.severity === filters.severity);

    // User filter
    const matchesUser = !filters.userId || (log.user_id === filters.userId);

    return matchesSearch && matchesAction && matchesResourceType && matchesDateRange && matchesAdmin && matchesSeverity && matchesUser;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LogIn className="h-4 w-4" />;
    if (action.includes('logout')) return <LogOut className="h-4 w-4" />;
    if (action.includes('create')) return <Plus className="h-4 w-4" />;
    if (action.includes('update')) return <Edit className="h-4 w-4" />;
    if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (action.includes('admin')) return <Shield className="h-4 w-4" />;
    if (action.includes('system')) return <Database className="h-4 w-4" />;
    if (action.includes('bill')) return <FileText className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login') || action.includes('register')) return 'text-green-500';
    if (action.includes('logout')) return 'text-blue-500';
    if (action.includes('delete')) return 'text-red-500';
    if (action.includes('suspend')) return 'text-yellow-500';
    if (action.includes('error')) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <XCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'info':
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    await loadActivityLogs();
    setRefreshing(false);
    toast.success('Activity logs refreshed');
  };

  const exportLogs = () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Admin ID', 'Action', 'Resource Type', 'IP Address', 'Details'];
      const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => [
          new Date(log.timestamp || log.created_at).toLocaleString(),
          log.admin_id || 'System',
          log.action,
          log.resource_type,
          log.ip_address || 'N/A',
          JSON.stringify(log.details).replace(/"/g, '""') // Escape quotes for CSV
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Activity logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const viewLogDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <span className="text-destructive font-medium text-lg">{error}</span>
        </div>
        <button
          onClick={loadActivityLogs}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all user activities and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredLogs.length} of {logs.length} logs
          </span>
          <button
            onClick={refreshLogs}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh Logs"
          >
            <Activity className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={exportLogs}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Export Logs"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs, users, actions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Action filter */}
          <select
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Resource type filter */}
          <select
            value={filters.resourceType}
            onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Resources</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Severity filter */}
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          {/* Date range filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* User ID filter */}
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Resource</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    {Object.values(filters).some(f => f !== 'all' && f !== '')
                      ? 'No logs match your filters'
                      : 'No activity logs found'
                    }
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="text-foreground">
                            {new Date(log.timestamp || log.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp || log.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.user_email || log.admin_id ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm min-w-0">
                            <p className="text-foreground truncate">
                              {log.user_full_name || log.user_email?.split('@')[0] || log.admin_id}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {log.user_email || `Admin: ${log.admin_id}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">System</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", getActionColor(log.action))}>
                          {getActionIcon(log.action)}
                        </div>
                        <span className="text-sm text-foreground">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-foreground capitalize">{log.resource_type}</p>
                        {log.resource_id && (
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {log.resource_id}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                        getSeverityColor(log.severity || 'info')
                      )}>
                        {getSeverityIcon(log.severity || 'info')}
                        {log.severity || 'info'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {log.ip_address || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewLogDetails(log)}
                        className="p-2 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {showLogModal && selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowLogModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Activity Log Details</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="text-foreground">
                    {new Date(selectedLog.timestamp || selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resource Type</label>
                  <p className="text-foreground capitalize">{selectedLog.resource_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Severity</label>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                    getSeverityColor(selectedLog.severity || 'info')
                  )}>
                    {getSeverityIcon(selectedLog.severity || 'info')}
                    {selectedLog.severity || 'info'}
                  </span>
                </div>
                {selectedLog.resource_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resource ID</label>
                    <p className="text-foreground font-mono text-sm">{selectedLog.resource_id}</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-foreground font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}
              </div>

              {/* User Information */}
              {selectedLog.user_email && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">User Information</label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Email: </span>
                      {selectedLog.user_email}
                    </p>
                    {selectedLog.user_full_name && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Name: </span>
                        {selectedLog.user_full_name}
                      </p>
                    )}
                    {selectedLog.session_id && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Session: </span>
                        <code className="text-xs">{selectedLog.session_id}</code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.user_agent && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                  <p className="text-sm text-foreground mt-1 font-mono">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {/* Details */}
              {selectedLog.details && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}