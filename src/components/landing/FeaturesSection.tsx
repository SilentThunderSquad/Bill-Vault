import { motion } from 'framer-motion';
import { ScanLine, ShieldCheck, BellDot, Lock, LayoutDashboard, Tags } from 'lucide-react';

const features = [
  {
    icon: ScanLine,
    title: 'OCR Bill Scanner & Text Extraction',
    description: 'Advanced OCR technology powered by Tesseract.js automatically extracts bill details, amounts, dates, and vendor information from photos. Save time with smart bill scanning.'
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Tracker & Product Management',
    description: 'Automatically track warranty expiry dates for all your products. Never miss a warranty claim again with our intelligent warranty tracking system.'
  },
  {
    icon: BellDot,
    title: 'Smart Warranty Alerts & Notifications',
    description: 'Get email and in-app notifications 30, 7, and 1 day before warranty expires. Customizable alert preferences ensure you never miss important dates.'
  },
  {
    icon: Lock,
    title: 'Secure Digital Receipt Storage',
    description: 'Enterprise-grade security with encrypted cloud storage via Supabase. Your bills and personal documents are protected with bank-level encryption.'
  },
  {
    icon: LayoutDashboard,
    title: 'Organized Bill Management Dashboard',
    description: 'View all your bills, active warranties, and upcoming expirations in one organized dashboard. Search, filter, and manage your documents effortlessly.'
  },
  {
    icon: Tags,
    title: 'Smart Bill Categories & Organization',
    description: 'Automatically categorize bills by type: Electronics, Appliances, Furniture, and more. Custom tags and folders keep everything organized.'
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Bill Management App Features - Warranty Tracker & OCR Scanner
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Everything you need to manage bills, track warranties, and store receipts digitally. Professional-grade bill management with smart automation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 mb-3 sm:mb-4 group-hover:from-accent/30 group-hover:to-secondary/30 transition-colors">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
