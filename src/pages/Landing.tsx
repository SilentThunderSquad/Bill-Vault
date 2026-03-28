import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { webApplicationSchema, organizationSchema } from '@/components/seo/schemas';
import { billVaultFAQSchema } from '@/components/seo/faqSchema';

export default function Landing() {
  return (
    <>
      <SEOHead
        title="Free Warranty Tracker & Bill Scanner App with OCR"
        description="Free warranty tracker and digital receipt storage app. Scan bills with OCR, track product warranties automatically, get expiry alerts, and manage all your receipts in one secure place. Never miss a warranty claim again!"
        keywords="warranty tracker app, free warranty tracker, bill scanner app, digital receipt storage, OCR bill scanner, warranty management app, receipt organizer, invoice manager, warranty expiry alert, product warranty tracker, bill vault, cloud receipt storage, warranty reminder app, best warranty tracker, free bill management app"
        url="https://billvault.silentthundersquad.in"
        type="website"
        schema={[organizationSchema, webApplicationSchema, billVaultFAQSchema]}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
