import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WarrantyBadge } from './WarrantyBadge';
import { FileThumbnail } from './FileThumbnail';
import { FilePreviewModal } from './FilePreviewModal';
import { formatDate, formatCurrency, getDaysRemaining } from '@/utils/formatters';
import { detectFileTypeFromUrl } from '@/utils/fileHelpers';
import { ArrowLeft, Trash2, Edit2, Calendar, Store, Tag, Receipt, CreditCard, Clock, FileText, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Bill } from '@/types';

interface BillDetailViewProps {
  bill: Bill;
  onDelete: () => void;
  onEdit: () => void;
  onRecover?: () => void;
  recovering?: boolean;
}

export function BillDetailView({ bill, onDelete, onEdit, onRecover, recovering }: BillDetailViewProps) {
  const navigate = useNavigate();
  const days = getDaysRemaining(bill.warranty_expiry);
  const [showPreview, setShowPreview] = useState(false);

  const fileType = detectFileTypeFromUrl(bill.bill_file_url);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-9">
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5 h-9">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl break-words">{bill.product_name}</CardTitle>
                {bill.brand && <p className="text-muted-foreground mt-1">{bill.brand}</p>}
              </div>
              <WarrantyBadge expiryDate={bill.warranty_expiry} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DetailRow icon={CreditCard} label="Price" value={formatCurrency(bill.price)} />
              <DetailRow icon={Store} label="Store" value={bill.store_name} />
              <DetailRow icon={Calendar} label="Purchase Date" value={formatDate(bill.purchase_date)} />
              <DetailRow
                icon={Clock}
                label="Warranty Expiry"
                value={`${formatDate(bill.warranty_expiry)} (${days >= 0 ? `${days} days left` : 'Expired'})`}
              />
              <DetailRow icon={Tag} label="Category" value={bill.category} />
              <DetailRow icon={Receipt} label="Invoice #" value={bill.invoice_number || 'N/A'} />
              <DetailRow icon={Clock} label="Warranty Period" value={`${bill.warranty_period_months} months`} />
              <DetailRow icon={FileText} label="Added" value={formatDate(bill.created_at)} />
            </div>

            {bill.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{bill.notes}</p>
                </div>
              </>
            )}

            {/* File Recovery Section - when file URL is missing */}
            {!bill.bill_file_url && onRecover && (
              <>
                <Separator />
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/20">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">File Missing</p>
                  <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                    This bill had a file attachment, but the link is broken.
                    You can try to recover it from storage.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRecover}
                    disabled={recovering}
                    className="gap-2"
                  >
                    <RefreshCw className={cn("h-4 w-4", recovering && "animate-spin")} />
                    {recovering ? 'Recovering...' : 'Try to Recover File'}
                  </Button>
                </div>
              </>
            )}

            {bill.bill_file_url && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-foreground">
                      Bill {fileType === 'pdf' ? 'Document' : 'Attachment'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      className="h-8 px-3"
                    >
                      View {fileType === 'pdf' ? 'PDF' : 'Image'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <FileThumbnail
                      fileUrl={bill.bill_file_url}
                      productName={bill.product_name}
                      size="lg"
                      onClick={() => setShowPreview(true)}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">
                        {fileType === 'pdf' ? 'PDF Document' : 'Image File'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click thumbnail or "View" button to open in full screen
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* File Preview Modal */}
      <FilePreviewModal
        fileUrl={bill.bill_file_url}
        fileName={`${bill.product_name} - Bill`}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}
