import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WarrantyBadge } from './WarrantyBadge';
import { FileThumbnail } from './FileThumbnail';
import { FilePreviewModal } from './FilePreviewModal';
import { formatDate, formatCurrency, getDaysRemaining } from '@/utils/formatters';
import { Calendar, Store, Tag } from 'lucide-react';
import type { Bill } from '@/types';

interface BillCardProps {
  bill: Bill;
  onClick: () => void;
}

const BillCard = React.memo(({ bill, onClick }: BillCardProps) => {
  // Memoize expensive calculations
  const warrantyInfo = useMemo(() => ({
    days: getDaysRemaining(bill.warranty_expiry),
    formattedDate: bill.purchase_date ? formatDate(bill.purchase_date) : null,
    formattedAmount: bill.total_amount ? formatCurrency(bill.total_amount) : null
  }), [bill.warranty_expiry, bill.purchase_date, bill.total_amount]);

  const [showPreview, setShowPreview] = useState(false);

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:border-accent/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 card-responsive"
        onClick={handleCardClick}
      >
        <CardContent className="p-4 sm:p-5 card-content">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 cell-text mr-2">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground text-truncate w-truncate-lg md-text-truncate-expand"
                      title={bill.product_name}>
                    {bill.product_name}
                  </h3>
                  {bill.brand && (
                    <p className="text-xs sm:text-sm text-muted-foreground text-truncate w-truncate-md"
                       title={bill.brand}>
                      {bill.brand}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <WarrantyBadge expiryDate={bill.warranty_expiry} />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="cell-content gap-2">
                  <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="cell-text text-truncate w-truncate-md" title={bill.store_name}>
                    {bill.store_name}
                  </span>
                </div>
                <div className="cell-content gap-2">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="text-truncate">{warrantyInfo.formattedDate}</span>
                </div>
                <div className="cell-content gap-2">
                  <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="text-truncate" title={bill.category}>{bill.category}</span>
                </div>
              </div>
            </div>

            {/* File Thumbnail */}
            {bill.bill_file_url && (
              <div className="shrink-0">
                <FileThumbnail
                  fileUrl={bill.bill_file_url}
                  productName={bill.product_name}
                  size="md"
                  onClick={handlePreviewClick}
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-foreground text-truncate">
              {formatCurrency(bill.price)}
            </span>
            {warrantyInfo.days >= 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                {warrantyInfo.days} days left
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      <FilePreviewModal
        fileUrl={bill.bill_file_url}
        fileName={`${bill.product_name} - Bill`}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
});

// Add displayName for better debugging
BillCard.displayName = 'BillCard';

// Export the memoized component
export { BillCard };
