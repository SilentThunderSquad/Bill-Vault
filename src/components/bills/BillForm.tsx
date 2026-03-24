import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES, DEFAULT_CURRENCY } from '@/utils/constants';
import { calculateExpiryDate } from '@/utils/formatters';
import { validateBillForm } from '@/utils/validators';
import { Loader2, Package, Calendar, Store, FileText, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BillFormData } from '@/types';

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit: (data: BillFormData, imageFile?: File) => void | Promise<void>;
  loading?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

const emptyForm: BillFormData = {
  product_name: '',
  brand: '',
  vendor_name: '',
  bill_number: '',
  purchase_date: '',
  has_warranty: true,
  warranty_period_months: '12',
  warranty_expiry: '',
  invoice_number: '',
  store_name: '',
  category: 'Electronics',
  price: '',
  currency: DEFAULT_CURRENCY,
  notes: '',
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
      <div className="p-1.5 rounded-md bg-accent/10">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
    </div>
  );
}

export function BillForm({
  initialData,
  onSubmit,
  loading,
  isSubmitting,
  submitLabel = 'Save Bill',
  onCancel,
}: BillFormProps) {
  const [form, setForm] = useState<BillFormData>({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isDisabled = loading || isSubmitting;

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Auto-calculate warranty expiry when purchase date or period changes (only if has_warranty is true)
  useEffect(() => {
    if (form.has_warranty && form.purchase_date && form.warranty_period_months) {
      const months = parseInt(form.warranty_period_months);
      if (!isNaN(months) && months >= 0) {
        const expiry = calculateExpiryDate(form.purchase_date, months);
        if (expiry) {
          setForm((prev) => ({ ...prev, warranty_expiry: expiry }));
        }
      }
    } else if (!form.has_warranty) {
      // Clear warranty fields when warranty is disabled
      setForm((prev) => ({ ...prev, warranty_period_months: '0', warranty_expiry: '' }));
    }
  }, [form.has_warranty, form.purchase_date, form.warranty_period_months]);

  const handleChange = (field: keyof BillFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBillForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Ensure currency is always INR for India-based project
    onSubmit({ ...form, currency: DEFAULT_CURRENCY });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Information */}
      <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
        <SectionHeader icon={Package} title="Product Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product_name" className="text-sm">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product_name"
              value={form.product_name}
              onChange={(e) => handleChange('product_name', e.target.value)}
              placeholder="e.g. MacBook Pro 16"
              className={`h-11 ${errors.product_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              aria-invalid={!!errors.product_name}
              aria-describedby={errors.product_name ? 'product_name-error' : undefined}
            />
            {errors.product_name && (
              <p id="product_name-error" className="text-xs text-destructive" role="alert">{errors.product_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm">Brand</Label>
            <Input
              id="brand"
              value={form.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="e.g. Apple"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={form.category} onValueChange={(v) => v && handleChange('category', v)}>
              <SelectTrigger className={`h-11 ${errors.category ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive" role="alert">{errors.category}</p>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
        <SectionHeader icon={Store} title="Purchase Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="store_name" className="text-sm">
              Store Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store_name"
              value={form.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              placeholder="e.g. Amazon, Croma"
              className={`h-11 ${errors.store_name ? 'border-destructive' : ''}`}
            />
            {errors.store_name && (
              <p className="text-xs text-destructive" role="alert">{errors.store_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor_name" className="text-sm">Vendor Name</Label>
            <Input
              id="vendor_name"
              value={form.vendor_name}
              onChange={(e) => handleChange('vendor_name', e.target.value)}
              placeholder="e.g. Apple Inc, Samsung"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice_number" className="text-sm">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={form.invoice_number}
              onChange={(e) => handleChange('invoice_number', e.target.value)}
              placeholder="e.g. INV-2024-001"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bill_number" className="text-sm">Bill Number</Label>
            <Input
              id="bill_number"
              value={form.bill_number}
              onChange={(e) => handleChange('bill_number', e.target.value)}
              placeholder="e.g. BIL-2024-001, TXN123456"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm">
              Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
              className={`h-11 ${errors.price ? 'border-destructive' : ''}`}
            />
            {errors.price && (
              <p className="text-xs text-destructive" role="alert">{errors.price}</p>
            )}
          </div>
        </div>
      </div>

      {/* Warranty Information */}
      <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
        <SectionHeader icon={Calendar} title="Warranty Information" />
        <div className="space-y-4">
          {/* Purchase Date - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date" className="text-sm">
                Purchase Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchase_date"
                type="date"
                value={form.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
                className={`h-11 ${errors.purchase_date ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.purchase_date}
              />
              {errors.purchase_date && (
                <p className="text-xs text-destructive" role="alert">{errors.purchase_date}</p>
              )}
            </div>

            {/* Has Warranty Toggle */}
            <div className="space-y-2">
              <Label htmlFor="has_warranty" className="text-sm">Has Warranty</Label>
              <div className="flex items-center h-11 gap-3">
                <Switch
                  id="has_warranty"
                  checked={form.has_warranty}
                  onCheckedChange={(checked) => handleChange('has_warranty', checked)}
                  disabled={isDisabled}
                />
                <span className="text-sm text-muted-foreground">
                  {form.has_warranty ? 'Product has warranty' : 'No warranty'}
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Fields - Conditionally rendered with smooth animation */}
          <AnimatePresence mode="wait">
            {form.has_warranty && (
              <motion.div
                key="warranty-fields"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="warranty_period_months" className="text-sm">
                      Warranty Period (months) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="warranty_period_months"
                      type="number"
                      min="0"
                      max="240"
                      value={form.warranty_period_months}
                      onChange={(e) => handleChange('warranty_period_months', e.target.value)}
                      placeholder="12"
                      className={`h-11 ${errors.warranty_period_months ? 'border-destructive' : ''}`}
                      disabled={isDisabled}
                    />
                    {errors.warranty_period_months && (
                      <p className="text-xs text-destructive" role="alert">{errors.warranty_period_months}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty_expiry" className="text-sm">Warranty Expiry</Label>
                    <Input
                      id="warranty_expiry"
                      type="date"
                      value={form.warranty_expiry}
                      onChange={(e) => handleChange('warranty_expiry', e.target.value)}
                      className="h-11"
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated from purchase date + warranty period
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-muted/30 rounded-xl p-4 sm:p-5">
        <SectionHeader icon={FileText} title="Additional Notes" />
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes about this product..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 w-full sm:w-auto h-11 gap-2"
          disabled={isDisabled}
        >
          {isDisabled ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
