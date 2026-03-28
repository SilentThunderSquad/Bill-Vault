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

export default function Landing() {
  return (
    <>
      <SEOHead
        title="Warranty Tracker App - Never Miss a Warranty Claim"
        description="The ultimate bill storage and warranty tracking app. Upload receipts with OCR scanning, track warranty expiry dates, and get smart alerts. Free warranty tracker for all your products."
        keywords="warranty tracker app, bill management app, invoice storage app, warranty reminder app, OCR bill scanner, digital receipt storage, warranty expiry alert, product warranty tracker, bill vault, invoice manager"
        url="https://billvault.silentthundersquad.in"
        type="website"
        schema={[organizationSchema, webApplicationSchema]}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
