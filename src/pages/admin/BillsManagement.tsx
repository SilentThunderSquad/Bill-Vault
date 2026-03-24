import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Download,
  Trash2,
  AlertTriangle,
  Calendar,
  DollarSign,
  User,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Image
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface Bill {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  title: string;
  total_amount: number | null;
  currency: string | null;
  date: string;
  category: string | null;
  vendor: string | null;
  description: string | null;
  has_warranty: boolean;
  warranty_expires_on: string | null;
  tags: string[] | null;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_text: string | null;
}

interface BillsFilters {
  search: string;
  status: 'all' | 'pending' | 'processing' | 'completed' | 'failed';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  hasWarranty: 'all' | 'yes' | 'no';
  minAmount: string;
  maxAmount: string;
}

export default function BillsManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BillsFilters>({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all',
    hasWarranty: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: billsError } = await supabase
        .from('admin_bills_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (billsError) {
        throw billsError;
      }

      setBills(data || []);
    } catch (err) {
      console.error('Error loading bills:', err);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        return now.toISOString().split('T')[0];
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString().split('T')[0];
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return yearAgo.toISOString().split('T')[0];
      default:
        return null;
    }
  };

  const filteredBills = bills.filter(bill => {
    // Search filter
    const matchesSearch = !filters.search ||
      bill.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.user_email.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.vendor?.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.user_full_name?.toLowerCase().includes(filters.search.toLowerCase());

    // Status filter
    const matchesStatus = filters.status === 'all' || bill.processing_status === filters.status;

    // Category filter
    const matchesCategory = filters.category === 'all' || bill.category === filters.category;

    // Warranty filter
    const matchesWarranty = filters.hasWarranty === 'all' ||
      (filters.hasWarranty === 'yes' && bill.has_warranty) ||
      (filters.hasWarranty === 'no' && !bill.has_warranty);

    // Date range filter
    const dateRangeFilter = getDateRangeFilter();
    const matchesDateRange = !dateRangeFilter || bill.date >= dateRangeFilter;

    // Amount range filter
    const matchesMinAmount = !filters.minAmount || !bill.total_amount ||
      bill.total_amount >= parseFloat(filters.minAmount);
    const matchesMaxAmount = !filters.maxAmount || !bill.total_amount ||
      bill.total_amount <= parseFloat(filters.maxAmount);

    return matchesSearch && matchesStatus && matchesCategory &&
           matchesWarranty && matchesDateRange && matchesMinAmount && matchesMaxAmount;
  });

  const handleBillAction = async (billId: string, action: 'view' | 'download' | 'delete') => {
    try {
      setActionLoading(billId);

      switch (action) {
        case 'view':
          const bill = bills.find(b => b.id === billId);
          if (bill) {
            setSelectedBill(bill);
            setShowBillModal(true);
          }
          break;
        case 'download':
          const downloadBill = bills.find(b => b.id === billId);
          if (downloadBill?.file_url) {
            const { data } = await supabase.storage
              .from('bill-documents')
              .createSignedUrl(downloadBill.file_url, 60);

            if (data?.signedUrl) {
              window.open(data.signedUrl, '_blank');
            } else {
              toast.error('Failed to generate download link');
            }
          } else {
            toast.error('No file available for download');
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
            try {
              const currentUser = (await supabase.auth.getUser()).data.user;

              // Delete the bill from database
              const { error: deleteError } = await supabase
                .from('bills')
                .delete()
                .eq('id', billId);

              if (deleteError) throw deleteError;

              // Delete the associated file from storage if it exists
              const bill = bills.find(b => b.id === billId);
              if (bill?.file_url) {
                await supabase.storage
                  .from('bill-documents')
                  .remove([bill.file_url]);
              }

              // Log admin action
              await supabase.from('admin_activity_logs').insert({
                admin_id: currentUser?.id,
                action: 'admin.bill_delete',
                resource_type: 'bill',
                resource_id: billId,
                details: {
                  title: bill?.title,
                  user_email: bill?.user_email
                }
              });

              setBills(prev => prev.filter(b => b.id !== billId));
              toast.success('Bill deleted successfully');
            } catch (error) {
              console.error('Error deleting bill:', error);
              toast.error('Failed to delete bill');
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error performing bill action:', error);
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString()}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'processing': return <Clock className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    const cats = bills.map(bill => bill.category).filter((cat): cat is string => Boolean(cat));
    return [...new Set(cats)];
  }, [bills]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bill Management</h1>
          <p className="text-muted-foreground">
            Manage and oversee all user bills and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredBills.length} of {bills.length} bills
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-4">
          {/* Search - Mobile friendly */}
          <div className="lg:col-span-2 xl:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Search Bills
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bills, users, vendors..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Processing Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Warranty filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Warranty Status
            </label>
            <select
              value={filters.hasWarranty}
              onChange={(e) => setFilters(prev => ({ ...prev, hasWarranty: e.target.value as any }))}
              className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Warranty</option>
              <option value="yes">Has Warranty</option>
              <option value="no">No Warranty</option>
            </select>
          </div>

          {/* Amount range */}
          <div className="lg:col-span-2 xl:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2 lg:hidden">
              Amount Range
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min amount"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="w-full px-3 py-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
            <button
              onClick={loadBills}
              className="ml-auto text-sm text-accent hover:text-accent/80"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Bills Table/Cards */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block table-responsive">
              <table className="w-full min-w-[900px] table-fixed">
                <colgroup>
                  <col className="w-1/4 min-w-[250px]" />
                  <col className="w-1/5 min-w-[160px]" />
                  <col className="w-[100px]" />
                  <col className="w-[120px]" />
                  <col className="w-[100px]" />
                  <col className="w-[80px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bill</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">File</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        {Object.values(filters).some(f => f !== 'all' && f !== '')
                          ? 'No bills match your filters'
                          : 'No bills found'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <motion.tr
                        key={bill.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="cell-content gap-3">
                            {bill.thumbnail_url ? (
                              <img
                                src={bill.thumbnail_url}
                                alt="Bill thumbnail"
                                className="w-10 h-10 rounded object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-accent" />
                              </div>
                            )}
                            <div className="cell-text">
                              <p className="font-medium text-foreground text-truncate w-truncate-lg" title={bill.title}>
                                {bill.title}
                              </p>
                              {bill.vendor && (
                                <p className="text-sm text-muted-foreground text-truncate w-truncate-md" title={bill.vendor}>
                                  {bill.vendor}
                                </p>
                              )}
                              {bill.category && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs text-muted-foreground text-truncate">{bill.category}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="cell-text">
                              <p className="text-sm font-medium text-foreground text-truncate w-truncate-sm"
                                 title={bill.user_full_name || bill.user_email}>
                                {bill.user_full_name || bill.user_email.split('@')[0]}
                              </p>
                              <p className="text-xs text-muted-foreground text-truncate w-truncate-sm"
                                 title={bill.user_email}>
                                {bill.user_email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium text-foreground text-truncate">
                              {formatCurrency(bill.total_amount)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-2">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0',
                              getStatusColor(bill.processing_status)
                            )}>
                              {getStatusIcon(bill.processing_status)}
                              <span className="hidden md:inline">{bill.processing_status}</span>
                            </span>
                            {bill.has_warranty && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-500 shrink-0"
                                    title="Has Warranty">
                                W
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground text-truncate">
                              {new Date(bill.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="cell-content gap-1">
                            <Image className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="text-sm min-w-0">
                              <p className="text-foreground text-truncate">{bill.file_type}</p>
                              <p className="text-xs text-muted-foreground text-truncate">
                                {formatFileSize(bill.file_size)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleBillAction(bill.id, 'view')}
                              disabled={actionLoading === bill.id}
                              className="hover:bg-accent/20 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-accent" />
                            </button>
                            <button
                              onClick={() => handleBillAction(bill.id, 'download')}
                              disabled={actionLoading === bill.id || !bill.file_url}
                              className="hover:bg-blue-500/20 rounded transition-colors"
                              title="Download File"
                            >
                              <Download className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleBillAction(bill.id, 'delete')}
                              disabled={actionLoading === bill.id}
                              className="hover:bg-destructive/20 rounded transition-colors"
                              title="Delete Bill"
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
            <div className="lg:hidden space-y-4 p-4">
              {filteredBills.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {Object.values(filters).some(f => f !== 'all' && f !== '')
                      ? 'No bills match your filters'
                      : 'No bills found'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBills.map((bill) => (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-background border border-border rounded-lg p-4 space-y-3 card-responsive"
                    >
                      {/* Bill Header */}
                      <div className="flex items-start gap-3">
                        {bill.thumbnail_url ? (
                          <img
                            src={bill.thumbnail_url}
                            alt="Bill thumbnail"
                            className="w-12 h-12 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-accent/20 rounded flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-accent" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-foreground text-truncate-2 break-words" title={bill.title}>
                            {bill.title}
                          </h3>
                          {bill.vendor && (
                            <p className="text-sm text-muted-foreground text-truncate break-words" title={bill.vendor}>
                              {bill.vendor}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border status-badge',
                              getStatusColor(bill.processing_status)
                            )}>
                              {getStatusIcon(bill.processing_status)}
                              {bill.processing_status}
                            </span>
                            {bill.has_warranty && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-500 status-badge">
                                Warranty
                              </span>
                            )}
                            {bill.category && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground status-badge">
                                <Tag className="h-3 w-3" />
                                {bill.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bill Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm py-3 border-t border-border">
                        <div className="cell-content gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="cell-text">
                            <p className="font-medium text-foreground text-truncate" title={bill.user_full_name || bill.user_email}>
                              {bill.user_full_name || bill.user_email.split('@')[0]}
                            </p>
                            <p className="text-xs text-muted-foreground text-truncate" title={bill.user_email}>
                              {bill.user_email}
                            </p>
                          </div>
                        </div>
                        <div className="cell-content gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground text-truncate">
                            {formatCurrency(bill.total_amount)}
                          </span>
                        </div>
                        <div className="cell-content gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-foreground text-truncate">
                            {new Date(bill.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="cell-content gap-2">
                          <Image className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="cell-text">
                            <p className="text-foreground text-truncate">{bill.file_type}</p>
                            <p className="text-xs text-muted-foreground text-truncate">
                              {formatFileSize(bill.file_size)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Optimized */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <button
                          onClick={() => handleBillAction(bill.id, 'view')}
                          disabled={actionLoading === bill.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors btn-responsive"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleBillAction(bill.id, 'download')}
                          disabled={actionLoading === bill.id || !bill.file_url}
                          className="p-2.5 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-colors btn-responsive"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleBillAction(bill.id, 'delete')}
                          disabled={actionLoading === bill.id}
                          className="p-2.5 hover:bg-destructive/20 text-destructive rounded-lg transition-colors btn-responsive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Category and Tags */}
                      {(bill.category || (bill.tags && bill.tags.length > 0)) && (
                        <div className="space-y-2">
                          {bill.category && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{bill.category}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleBillAction(bill.id, 'view')}
                          disabled={actionLoading === bill.id}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleBillAction(bill.id, 'download')}
                          disabled={actionLoading === bill.id || !bill.file_url}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleBillAction(bill.id, 'delete')}
                          disabled={actionLoading === bill.id}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bill Detail Modal */}
      {showBillModal && selectedBill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm lg:p-4"
          onClick={() => setShowBillModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-none lg:rounded-lg w-full h-full lg:w-auto lg:h-auto lg:max-w-4xl lg:max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 lg:p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Bill Details</h2>
              <button
                onClick={() => setShowBillModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-2xl lg:text-base"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 lg:p-6">
              <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {/* Bill Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground lg:hidden">Information</h3>
                  <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                      <p className="text-base text-foreground">{selectedBill.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Amount</label>
                      <p className="text-base text-foreground font-medium">
                        {formatCurrency(selectedBill.total_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Vendor</label>
                      <p className="text-base text-foreground">{selectedBill.vendor || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                      <p className="text-base text-foreground">{selectedBill.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                      <p className="text-base text-foreground">
                        {new Date(selectedBill.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border',
                        getStatusColor(selectedBill.processing_status)
                      )}>
                        {getStatusIcon(selectedBill.processing_status)}
                        {selectedBill.processing_status}
                      </span>
                    </div>
                  </div>

                  {selectedBill.description && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                      <p className="text-base text-foreground bg-muted/30 p-3 rounded-lg">{selectedBill.description}</p>
                    </div>
                  )}

                  {selectedBill.has_warranty && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Warranty</label>
                      <p className="text-base text-foreground">
                        Expires: {selectedBill.warranty_expires_on
                          ? new Date(selectedBill.warranty_expires_on).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  )}

                  {selectedBill.tags && selectedBill.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedBill.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent/20 text-accent text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Information */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-base font-medium text-foreground mb-3">User Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">Name:</span>
                        <span className="text-foreground font-medium">
                          {selectedBill.user_full_name || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">Email:</span>
                        <span className="text-foreground">
                          {selectedBill.user_email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Preview */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3 lg:hidden">File Preview</h3>
                  <label className="hidden lg:block text-sm font-medium text-muted-foreground mb-2">File Preview</label>
                  {selectedBill.thumbnail_url ? (
                    <div>
                      <img
                        src={selectedBill.thumbnail_url}
                        alt="Bill document"
                        className="w-full max-w-md mx-auto lg:mx-0 rounded-lg border border-border"
                      />
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>Type: {selectedBill.file_type}</p>
                        <p>Size: {formatFileSize(selectedBill.file_size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 lg:p-12 border-2 border-dashed border-border rounded-lg text-center">
                      <FileText className="h-16 w-16 lg:h-12 lg:w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No preview available</p>
                      {selectedBill.file_type && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedBill.file_type}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* OCR Text */}
              {selectedBill.ocr_text && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-base font-medium text-foreground mb-3">Extracted Text (OCR)</h4>
                  <div className="p-4 bg-muted/50 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedBill.ocr_text}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4 lg:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:justify-end lg:gap-2">
                <button
                  onClick={() => selectedBill.file_url && handleBillAction(selectedBill.id, 'download')}
                  disabled={!selectedBill.file_url}
                  className="w-full lg:w-auto px-6 py-3 lg:py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 font-medium"
                >
                  Download File
                </button>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="w-full lg:w-auto px-6 py-3 lg:py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}