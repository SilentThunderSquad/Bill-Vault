import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { sanitizeHtml } from '@/utils/security';
import { activityTracker, ActivityHelpers } from '@/services/activityTracker';
import { DEFAULT_CURRENCY } from '@/utils/constants';
import type { Bill, BillFormData } from '@/types';

const PAGE_SIZE = 20;

/** Extract storage file path from a Supabase public URL */
function getStoragePath(publicUrl: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    // Strip query params (cache busters like ?t=123)
    const path = publicUrl.substring(idx + marker.length).split('?')[0];
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

/** Delete a file from Supabase storage (best-effort, won't throw) */
async function deleteStorageFile(bucket: string, publicUrl: string | null | undefined) {
  if (!publicUrl) return;
  const path = getStoragePath(publicUrl, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchBills = useCallback(async (reset = true) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError, count } = await supabase
      .from('bills')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      if (reset) {
        setBills(data ?? []);
        setPage(1);
      } else {
        setBills((prev) => [...prev, ...(data ?? [])]);
        setPage(currentPage + 1);
      }
      setHasMore((count ?? 0) > from + (data?.length ?? 0));
    }
    setLoading(false);
  }, [user, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchBills(false);
    }
  }, [loading, hasMore, fetchBills]);

  const fetchBill = useCallback(async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error: fetchError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    return data as Bill;
  }, [user]);

  const createBill = async (formData: BillFormData, file?: File) => {
    if (!user) throw new Error('Not authenticated');

    // Refresh session to ensure valid JWT for RLS
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Session expired. Please sign in again.');
    }

    let bill_file_url: string | null = null;

    if (file) {
      // Check if file is supported (images or PDF)
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        throw new Error('Unsupported file type. Only images and PDF files are allowed.');
      }

      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

      // Use the same bucket for both images and PDFs
      const { error: uploadError } = await supabase.storage
        .from('bill-images')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('bill-images')
        .getPublicUrl(filePath);
      bill_file_url = urlData.publicUrl;
    }

    // Sanitize text inputs to prevent XSS
    const { data, error: insertError } = await supabase
      .from('bills')
      .insert({
        user_id: user.id,
        product_name: sanitizeHtml(formData.product_name),
        brand: formData.brand ? sanitizeHtml(formData.brand) : null,
        vendor_name: formData.vendor_name ? sanitizeHtml(formData.vendor_name) : null,
        bill_number: formData.bill_number ? sanitizeHtml(formData.bill_number) : null,
        purchase_date: formData.purchase_date,
        has_warranty: formData.has_warranty,
        warranty_period_months: formData.has_warranty
          ? Math.min(Math.max(parseInt(formData.warranty_period_months) || 12, 0), 240)
          : 0,
        warranty_expiry: formData.has_warranty ? formData.warranty_expiry : '',
        invoice_number: formData.invoice_number ? sanitizeHtml(formData.invoice_number) : null,
        store_name: sanitizeHtml(formData.store_name),
        category: formData.category,
        price: Math.max(parseFloat(formData.price) || 0, 0),
        currency: DEFAULT_CURRENCY,
        notes: formData.notes ? sanitizeHtml(formData.notes) : null,
        bill_file_url,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Log activity
    try {
      await activityTracker.logActivity(
        ActivityHelpers.billAdded(data.id, data.product_name)
      );
    } catch (error) {
      console.error('Failed to log bill creation activity:', error);
    }

    // Add to local state
    setBills((prev) => [data as Bill, ...prev]);
    return data as Bill;
  };

  const updateBill = async (id: string, formData: Partial<BillFormData>, newFile?: File) => {
    if (!user) throw new Error('Not authenticated');

    const update: Record<string, unknown> = {};

    if (formData.product_name !== undefined) update.product_name = sanitizeHtml(formData.product_name);
    if (formData.brand !== undefined) update.brand = formData.brand ? sanitizeHtml(formData.brand) : null;
    if (formData.vendor_name !== undefined) update.vendor_name = formData.vendor_name ? sanitizeHtml(formData.vendor_name) : null;
    if (formData.bill_number !== undefined) update.bill_number = formData.bill_number ? sanitizeHtml(formData.bill_number) : null;
    if (formData.purchase_date !== undefined) update.purchase_date = formData.purchase_date;
    if (formData.has_warranty !== undefined) update.has_warranty = formData.has_warranty;
    if (formData.warranty_period_months !== undefined) {
      // Only set warranty period if has_warranty is true (or if has_warranty is not being updated)
      const hasWarranty = formData.has_warranty !== undefined ? formData.has_warranty : true;
      update.warranty_period_months = hasWarranty
        ? Math.min(Math.max(parseInt(formData.warranty_period_months) || 12, 0), 240)
        : 0;
    }
    if (formData.warranty_expiry !== undefined) {
      const hasWarranty = formData.has_warranty !== undefined ? formData.has_warranty : true;
      update.warranty_expiry = hasWarranty ? formData.warranty_expiry : '';
    }
    if (formData.invoice_number !== undefined) update.invoice_number = formData.invoice_number ? sanitizeHtml(formData.invoice_number) : null;
    if (formData.store_name !== undefined) update.store_name = sanitizeHtml(formData.store_name);
    if (formData.category !== undefined) update.category = formData.category;
    if (formData.price !== undefined) update.price = Math.max(parseFloat(formData.price) || 0, 0);
    if (formData.currency !== undefined) update.currency = DEFAULT_CURRENCY;
    if (formData.notes !== undefined) update.notes = formData.notes ? sanitizeHtml(formData.notes) : null;

    // Handle new file upload (image or PDF)
    if (newFile) {
      // Check if file is supported
      const isImage = newFile.type.startsWith('image/');
      const isPDF = newFile.type === 'application/pdf';

      if (!isImage && !isPDF) {
        throw new Error('Unsupported file type. Only images and PDF files are allowed.');
      }

      // Get old file URL to clean up after successful upload
      const { data: existingBill } = await supabase
        .from('bills')
        .select('bill_file_url')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      const sanitizedName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('bill-images')
        .upload(filePath, newFile);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('bill-images')
        .getPublicUrl(filePath);
      update.bill_file_url = urlData.publicUrl;

      // Delete old file from storage (best-effort)
      await deleteStorageFile('bill-images', existingBill?.bill_file_url);
    }

    const { data, error: updateError } = await supabase
      .from('bills')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log activity
    try {
      await activityTracker.logActivity(
        ActivityHelpers.billUpdated(data.id, data.product_name)
      );
    } catch (error) {
      console.error('Failed to log bill update activity:', error);
    }

    // Update local state
    setBills((prev) => prev.map((b) => (b.id === id ? (data as Bill) : b)));
    return data as Bill;
  };

  const deleteBill = async (billId: string) => {
    if (!user) throw new Error('Not authenticated');

    // Fetch the bill first to get the file URL and product name for cleanup and logging
    const { data: bill } = await supabase
      .from('bills')
      .select('bill_file_url, product_name')
      .eq('id', billId)
      .eq('user_id', user.id)
      .single();

    // Hard-delete from database
    const { error: deleteError } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // Log activity
    try {
      await activityTracker.logActivity(
        ActivityHelpers.billDeleted(bill?.product_name || 'Unknown Item')
      );
    } catch (error) {
      console.error('Failed to log bill deletion activity:', error);
    }

    // Clean up associated file from storage (best-effort)
    await deleteStorageFile('bill-images', bill?.bill_file_url);

    setBills((prev) => prev.filter((b) => b.id !== billId));
  };

  return {
    bills,
    loading,
    error,
    hasMore,
    fetchBills,
    fetchBill,
    createBill,
    updateBill,
    deleteBill,
    loadMore,
  };
}
