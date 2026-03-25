import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { BillDetailView } from '@/components/bills/BillDetailView';
import { BillForm } from '@/components/bills/BillForm';
import { DeleteConfirmDialog } from '@/components/bills/DeleteConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Bill, BillFormData } from '@/types';

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBill, updateBill, deleteBill, recoverOrphanedFiles } = useBills();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBill(id)
      .then(setBill)
      .catch(() => toast.error('Bill not found'))
      .finally(() => setLoading(false));
  }, [id, fetchBill]);

  const handleRecover = async () => {
    if (!bill) return;

    setRecovering(true);
    try {
      const recovered = await recoverOrphanedFiles();
      const thisBillRecovered = recovered.find(r => r.billId === bill.id);

      if (thisBillRecovered) {
        // Refresh the bill data to show the recovered file
        const updatedBill = await fetchBill(id!);
        setBill(updatedBill);
        toast.success('File recovered successfully!');
      } else {
        toast.info('No matching file found in storage for recovery');
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast.error('Failed to recover file. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteBill(id);
      toast.success('Bill deleted');
      navigate('/bills');
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveEdit = async (formData: BillFormData, imageFile?: File) => {
    if (!id || !bill) return;
    setSaving(true);
    try {
      const updatedBill = await updateBill(id, formData, imageFile);
      setBill(updatedBill);
      setEditMode(false);
      toast.success('Bill updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update bill');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Bill not found</p>
        <Button variant="outline" onClick={() => navigate('/bills')} className="mt-4">
          Go to Bills
        </Button>
      </div>
    );
  }

  if (editMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Edit Bill</h1>
        </div>
        <BillForm
          initialData={{
            product_name: bill.product_name,
            brand: bill.brand || '',
            vendor_name: bill.vendor_name || '',
            bill_number: bill.bill_number || '',
            purchase_date: bill.purchase_date,
            has_warranty: bill.has_warranty,
            warranty_period_months: String(bill.warranty_period_months),
            warranty_expiry: bill.warranty_expiry,
            invoice_number: bill.invoice_number || '',
            store_name: bill.store_name,
            category: bill.category,
            price: String(bill.price),
            currency: bill.currency,
            notes: bill.notes || '',
          }}
          onSubmit={handleSaveEdit}
          submitLabel={saving ? 'Saving...' : 'Save Changes'}
          isSubmitting={saving}
        />
      </motion.div>
    );
  }

  return (
    <>
      <BillDetailView
        bill={bill}
        onDelete={() => setDeleteOpen(true)}
        onEdit={handleEdit}
        onRecover={handleRecover}
        recovering={recovering}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        productName={bill.product_name}
      />
    </>
  );
}
