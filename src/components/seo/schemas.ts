export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    url?: string;
  };
}

export interface WebApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'WebApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  featureList: string[];
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  author?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    ratingCount: string;
    bestRating: string;
    worstRating: string;
  };
}

export interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  featureList: string[];
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

// Pre-defined schemas for Bill Vault
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Bill Vault',
  url: 'https://billvault.silentthundersquad.in',
  description: 'Digital bill storage and warranty tracking platform that helps users manage their receipts, track warranties, and never miss important expiry dates.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: 'https://billvault.silentthundersquad.in'
  }
};

export const webApplicationSchema: WebApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Bill Vault',
  description: 'Store bills securely, track product warranties, and get alerts before they expire. Free warranty tracker app with OCR bill scanning.',
  url: 'https://billvault.silentthundersquad.in',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  featureList: [
    'Digital bill storage with cloud sync',
    'OCR bill scanning and data extraction',
    'Warranty tracking and expiry alerts',
    'Smart notification system',
    'Secure encrypted document storage',
    'Mobile responsive interface',
    'Dark/light theme support',
    'Search and filter capabilities'
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  author: {
    '@type': 'Organization',
    name: 'Bill Vault',
    url: 'https://billvault.silentthundersquad.in'
  }
};

export const softwareApplicationSchema: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Bill Vault - Warranty Tracker',
  description: 'Professional bill management and warranty tracking application with OCR technology for automatic data extraction.',
  url: 'https://billvault.silentthundersquad.in',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  featureList: [
    'Bill scanning with OCR',
    'Warranty expiry tracking',
    'Cloud-based storage',
    'Smart notifications',
    'Mobile responsive design',
    'Document search',
    'Export capabilities'
  ],
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD'
  }
};

// Helper function to create breadcrumb schema
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}