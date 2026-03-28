export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export function createFAQSchema(faqs: FAQItem[]): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Pre-defined FAQ for Bill Vault
export const billVaultFAQs: FAQItem[] = [
  {
    question: 'What is Bill Vault and how does it work?',
    answer: 'Bill Vault is a free digital bill management and warranty tracking app. It allows you to scan bills using OCR technology, store them securely in the cloud, track product warranties, and receive alerts before warranties expire. Simply upload your bill, and our app automatically extracts key information like purchase date, warranty period, and product details.'
  },
  {
    question: 'Is Bill Vault really free to use?',
    answer: 'Yes, Bill Vault is completely free to use. You can store unlimited bills, track warranties, receive expiry alerts, and access all core features at no cost. We believe in making bill management and warranty tracking accessible to everyone.'
  },
  {
    question: 'How does the OCR bill scanning feature work?',
    answer: 'Our OCR (Optical Character Recognition) technology automatically reads text from your bill images or PDF files. When you upload a bill, the app extracts important information such as merchant name, purchase date, total amount, product details, and warranty information. This eliminates manual data entry and saves you time.'
  },
  {
    question: 'How secure is my data in Bill Vault?',
    answer: 'Your data security is our top priority. All bills and documents are encrypted during upload and storage. We use enterprise-grade security with Supabase backend, ensuring your sensitive information is protected. Your bills are stored securely in the cloud and only accessible by you with your secure login credentials.'
  },
  {
    question: 'Can I access my bills across multiple devices?',
    answer: 'Yes! Bill Vault is a Progressive Web App (PWA) that works seamlessly across all devices - desktop, tablet, and mobile. Your bills are synced in real-time to the cloud, so you can access them from any device with an internet connection. Install the app on your phone for quick access anytime, anywhere.'
  },
  {
    question: 'How do warranty expiry alerts work?',
    answer: 'When you upload a bill with warranty information, Bill Vault automatically calculates the warranty expiration date. You\'ll receive notifications before the warranty expires, giving you time to make claims if needed. You can customize alert settings to receive notifications via in-app alerts, push notifications, or email reminders.'
  },
  {
    question: 'What types of bills and documents can I store?',
    answer: 'You can store any type of bill, receipt, or invoice - electronics purchases, appliances, furniture, vehicle documents, medical bills, insurance papers, and more. Bill Vault supports various file formats including JPG, PNG, PDF, and other image formats. Organize them by categories for easy retrieval.'
  },
  {
    question: 'Can I export or download my bills?',
    answer: 'Yes, you can download individual bills or export multiple bills at once. This feature is useful for warranty claims, returns, expense reports, tax filing, or creating backups. Your data remains yours, and you have full control over exporting and managing it.'
  },
  {
    question: 'Do I need to create an account to use Bill Vault?',
    answer: 'Yes, creating a free account is required to use Bill Vault. This ensures your bills are securely stored and accessible across devices. You can sign up using email/password or use OAuth providers like Google for quick registration. Account creation takes less than a minute.'
  },
  {
    question: 'What happens if I lose my phone or device?',
    answer: 'Since all your bills are stored securely in the cloud, you won\'t lose any data if you lose your device. Simply log in to Bill Vault from any device using your credentials, and all your bills and warranties will be instantly available. This cloud-based approach ensures your important documents are always safe and accessible.'
  },
  {
    question: 'Can Bill Vault help me organize receipts for tax purposes?',
    answer: 'Absolutely! Bill Vault makes it easy to organize and categorize your receipts throughout the year. You can search, filter, and export bills by date range, category, or merchant. This makes tax preparation much simpler, as all your receipts are organized and easily retrievable when you need them.'
  },
  {
    question: 'Is there a limit to how many bills I can store?',
    answer: 'Bill Vault offers generous storage limits for free users. You can store hundreds of bills without any restrictions. If you need additional storage for large PDF files or extensive archives, premium plans may be available in the future, but the free tier is designed to meet most users\' needs.'
  }
];

export const billVaultFAQSchema = createFAQSchema(billVaultFAQs);
