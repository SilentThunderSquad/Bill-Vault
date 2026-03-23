import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Search,
  Download,
  Trash2,
  Eye,
  FileText,
  Image,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  Folder,
  Archive,
  RefreshCw,
  Filter
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
  user_id: string | null;
  user_email: string | null;
  bill_id: string | null;
  bill_title: string | null;
  is_thumbnail: boolean;
  last_accessed_at: string | null;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  documentFiles: number;
  documentSize: number;
  imageFiles: number;
  imageSize: number;
  thumbnailFiles: number;
  thumbnailSize: number;
  orphanedFiles: number;
  orphanedSize: number;
}

interface StorageFilters {
  search: string;
  fileType: 'all' | 'document' | 'image' | 'thumbnail' | 'orphaned';
  sizeRange: 'all' | 'small' | 'medium' | 'large';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

export default function StorageManagement() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<StorageFilters>({
    search: '',
    fileType: 'all',
    sizeRange: 'all',
    dateRange: 'all'
  });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<StorageFile | null>(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get storage files from Supabase storage and cross-reference with bills
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('bill-images')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        throw storageError;
      }

      // Get bill metadata to cross-reference storage files
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select(`
          id,
          bill_file_url,
          product_name,
          user_id,
          created_at
        `);

      if (billsError) {
        throw billsError;
      }

      // Get user emails for storage files
      const { data: userProfiles, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', bills.map(b => b.user_id));

      if (userError) {
        console.warn('Could not load user profiles:', userError);
      }

      // Convert storage file data to our interface format
      const processedFiles: StorageFile[] = storageFiles
        ?.filter(file => file.name !== '.emptyFolderPlaceholder')
        ?.map(file => {
          // Find associated bill
          const associatedBill = bills.find(bill =>
            bill.bill_file_url && bill.bill_file_url.includes(file.name)
          );

          // Find user profile
          const userProfile = associatedBill ?
            userProfiles?.find(up => up.user_id === associatedBill.user_id) : null;

          return {
            id: file.id || `${file.name}-${Date.now()}`,
            name: file.name,
            path: `bill-images/${file.name}`,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'unknown',
            uploaded_at: file.created_at || file.updated_at || new Date().toISOString(),
            user_id: associatedBill?.user_id || null,
            user_email: userProfile?.full_name || 'Unknown User',
            bill_id: associatedBill?.id || null,
            bill_title: associatedBill?.product_name || null,
            is_thumbnail: file.name.includes('thumb') || file.name.includes('thumbnail'),
            last_accessed_at: file.last_accessed_at || null
          };
        }) || [];

      setFiles(processedFiles);

      // Calculate real storage statistics
      const totalFiles = processedFiles.length;
      const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);
      const documentFiles = processedFiles.filter(f => f.type.includes('pdf') && !f.is_thumbnail).length;
      const documentSize = processedFiles.filter(f => f.type.includes('pdf') && !f.is_thumbnail).reduce((sum, f) => sum + f.size, 0);
      const imageFiles = processedFiles.filter(f => f.type.includes('image') && !f.is_thumbnail).length;
      const imageSize = processedFiles.filter(f => f.type.includes('image') && !f.is_thumbnail).reduce((sum, f) => sum + f.size, 0);
      const thumbnailFiles = processedFiles.filter(f => f.is_thumbnail).length;
      const thumbnailSize = processedFiles.filter(f => f.is_thumbnail).reduce((sum, f) => sum + f.size, 0);
      const orphanedFiles = processedFiles.filter(f => !f.user_id || !f.bill_id).length;
      const orphanedSize = processedFiles.filter(f => !f.user_id || !f.bill_id).reduce((sum, f) => sum + f.size, 0);

      setStats({
        totalFiles,
        totalSize,
        documentFiles,
        documentSize,
        imageFiles,
        imageSize,
        thumbnailFiles,
        thumbnailSize,
        orphanedFiles,
        orphanedSize
      });

    } catch (err) {
      console.error('Error loading storage data:', err);
      setError('Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, isThumbnail: boolean) => {
    if (isThumbnail) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string, isThumbnail: boolean) => {
    if (isThumbnail) return 'text-purple-500';
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('image')) return 'text-green-500';
    return 'text-gray-500';
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = !filters.search ||
      file.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      file.user_email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      file.bill_title?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = filters.fileType === 'all' ||
      (filters.fileType === 'document' && file.type.includes('pdf') && !file.is_thumbnail) ||
      (filters.fileType === 'image' && file.type.includes('image') && !file.is_thumbnail) ||
      (filters.fileType === 'thumbnail' && file.is_thumbnail) ||
      (filters.fileType === 'orphaned' && (!file.user_id || !file.bill_id));

    const matchesSize = filters.sizeRange === 'all' ||
      (filters.sizeRange === 'small' && file.size < 100000) ||
      (filters.sizeRange === 'medium' && file.size >= 100000 && file.size < 1000000) ||
      (filters.sizeRange === 'large' && file.size >= 1000000);

    const matchesDate = filters.dateRange === 'all' ||
      (filters.dateRange === 'today' && new Date(file.uploaded_at).toDateString() === new Date().toDateString()) ||
      (filters.dateRange === 'week' && new Date(file.uploaded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filters.dateRange === 'month' && new Date(file.uploaded_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filters.dateRange === 'year' && new Date(file.uploaded_at) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesType && matchesSize && matchesDate;
  });

  const handleFileAction = async (fileId: string, action: 'download' | 'delete' | 'preview') => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      switch (action) {
        case 'download':
          // Create signed URL for download
          const { data } = await supabase.storage
            .from('bill-images')
            .createSignedUrl(file.path, 60);

          if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
          } else {
            toast.error('Failed to generate download link');
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            await supabase.storage
              .from('bill-images')
              .remove([file.path]);

            setFiles(prev => prev.filter(f => f.id !== fileId));
            toast.success('File deleted successfully');
          }
          break;
        case 'preview':
          setShowPreview(file);
          break;
      }
    } catch (error) {
      console.error('Error performing file action:', error);
      toast.error('Failed to perform action');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedFiles.size} selected files? This action cannot be undone.`)) {
      try {
        const filesToDelete = files.filter(f => selectedFiles.has(f.id));
        const paths = filesToDelete.map(f => f.path);

        await supabase.storage
          .from('bill-images')
          .remove(paths);

        setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
        setSelectedFiles(new Set());
        toast.success(`${filesToDelete.length} files deleted successfully`);
      } catch (error) {
        console.error('Error deleting files:', error);
        toast.error('Failed to delete files');
      }
    }
  };

  const cleanupOrphanedFiles = async () => {
    if (window.confirm('This will delete all orphaned files (files without associated users or bills). Continue?')) {
      try {
        const orphanedFiles = files.filter(f => !f.user_id || !f.bill_id);
        const paths = orphanedFiles.map(f => f.path);

        if (paths.length > 0) {
          await supabase.storage
            .from('bill-images')
            .remove(paths);

          setFiles(prev => prev.filter(f => f.user_id && f.bill_id));
          toast.success(`${orphanedFiles.length} orphaned files cleaned up`);
        } else {
          toast.info('No orphaned files found');
        }
      } catch (error) {
        console.error('Error cleaning up files:', error);
        toast.error('Failed to cleanup orphaned files');
      }
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
    toast.success('Storage data refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Storage Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage file storage across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={cleanupOrphanedFiles}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Cleanup Orphaned
          </button>
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Delete Selected ({selectedFiles.size})
            </button>
          )}
        </div>
      </div>

      {/* Storage Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-xl font-bold text-foreground">{formatBytes(stats.totalSize)}</p>
                <p className="text-xs text-muted-foreground">{stats.totalFiles} files</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-xl font-bold text-foreground">{formatBytes(stats.documentSize)}</p>
                <p className="text-xs text-muted-foreground">{stats.documentFiles} files</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Image className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-xl font-bold text-foreground">{formatBytes(stats.imageSize)}</p>
                <p className="text-xs text-muted-foreground">{stats.imageFiles} files</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Orphaned Files</p>
                <p className="text-xl font-bold text-foreground">{formatBytes(stats.orphanedSize)}</p>
                <p className="text-xs text-muted-foreground">{stats.orphanedFiles} files</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files, users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={filters.fileType}
            onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All File Types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="thumbnail">Thumbnails</option>
            <option value="orphaned">Orphaned Files</option>
          </select>

          <select
            value={filters.sizeRange}
            onChange={(e) => setFilters(prev => ({ ...prev, sizeRange: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (&lt; 100KB)</option>
            <option value="medium">Medium (100KB - 1MB)</option>
            <option value="large">Large (&gt; 1MB)</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">File</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Uploaded</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <HardDrive className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No files found matching your filters
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSelected.add(file.id);
                          } else {
                            newSelected.delete(file.id);
                          }
                          setSelectedFiles(newSelected);
                        }}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded", getFileTypeColor(file.type, file.is_thumbnail))}>
                          {getFileIcon(file.type, file.is_thumbnail)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.type} {file.is_thumbnail && '(thumbnail)'}
                          </p>
                          {file.bill_title && (
                            <p className="text-xs text-muted-foreground truncate">
                              Bill: {file.bill_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {file.user_email ? (
                        <div className="text-sm">
                          <p className="text-foreground">{file.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
                          Orphaned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-foreground">{formatBytes(file.size)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-foreground">
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.uploaded_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {file.last_accessed_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                          <Clock className="h-3 w-3 mr-1" />
                          Unused
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFileAction(file.id, 'preview')}
                          className="p-1 hover:bg-accent/20 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-accent" />
                        </button>
                        <button
                          onClick={() => handleFileAction(file.id, 'download')}
                          className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleFileAction(file.id, 'delete')}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors"
                          title="Delete"
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
      </div>

      {/* File Preview Modal */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowPreview(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">File Preview</h2>
              <button
                onClick={() => setShowPreview(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="text-foreground">{showPreview.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Size</label>
                  <p className="text-foreground">{formatBytes(showPreview.size)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-foreground">{showPreview.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded</label>
                  <p className="text-foreground">
                    {new Date(showPreview.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium text-muted-foreground">Path</label>
                <p className="text-foreground font-mono text-sm break-all">{showPreview.path}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleFileAction(showPreview.id, 'download')}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => setShowPreview(null)}
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