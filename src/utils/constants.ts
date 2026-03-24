export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Appliances',
  'Furniture',
  'Clothing',
  'Automobile',
  'Health & Beauty',
  'Sports & Fitness',
  'Jewelry',
  'Software',
  'Home & Garden',
  'Toys',
  'Other',
] as const;

export const WARRANTY_STATUSES = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expiring: { label: 'Expiring Soon', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const;

// Fixed to INR for India-based project
export const DEFAULT_CURRENCY = 'INR' as const;

export const EXPIRING_SOON_DAYS = 30;
