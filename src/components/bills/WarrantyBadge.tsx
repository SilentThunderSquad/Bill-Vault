import React, { useMemo } from 'react';
import { getWarrantyStatus } from '@/utils/formatters';
import { WARRANTY_STATUSES } from '@/utils/constants';

interface WarrantyBadgeProps {
  expiryDate: string;
}

const WarrantyBadge = React.memo(({ expiryDate }: WarrantyBadgeProps) => {
  // Memoize the warranty status calculation
  const warrantyInfo = useMemo(() => {
    const status = getWarrantyStatus(expiryDate);
    return WARRANTY_STATUSES[status];
  }, [expiryDate]);

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${warrantyInfo.color}`}>
      {warrantyInfo.label}
    </span>
  );
});

// Add displayName for better debugging
WarrantyBadge.displayName = 'WarrantyBadge';

// Export the memoized component
export { WarrantyBadge };
