import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, UserCheck, Shield, AlertTriangle, FileText, Users, ArrowLeft } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { createBreadcrumbSchema } from '@/components/seo/schemas';

export default function TermsOfService() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://billvault.silentthundersquad.in/' },
    { name: 'Terms of Service', url: 'https://billvault.silentthundersquad.in/terms-of-service' }
  ]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <UserCheck className="h-5 w-5" />,
      content: (
        <>
          <p className="mb-4">
            Welcome to Bill Vault. These Terms of Service ("Terms") govern your use of the Bill Vault application and related services (collectively, the "Service") provided by Bill Vault ("we," "us," or "our").
          </p>
          <p className="mb-4">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Service.
          </p>
          <p className="mb-4">
            These Terms apply to all visitors, users, and others who access or use the Service. Our Privacy Policy explains how we collect and use your information when you use our Service.
          </p>
          <p>
            We reserve the right to update and change these Terms by posting updates and changes to our website. You are advised to check the Terms periodically for changes as they are binding.
          </p>
        </>
      )
    },
    {
      id: 'description',
      title: 'Description of Service',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <>
          <p className="mb-4">
            Bill Vault is a personal financial management application that allows users to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Upload, store, and organize bills and receipts</li>
            <li>Track product warranties and receive expiration notifications</li>
            <li>Use OCR (Optical Character Recognition) to extract data from documents</li>
            <li>Categorize and search financial documents</li>
            <li>Access documents through web and mobile interfaces</li>
            <li>Export and download personal financial data</li>
          </ul>
          <p className="mb-4">
            The Service is provided for personal, non-commercial use only. Commercial use of the Service requires a separate commercial agreement.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
          </p>
        </>
      )
    },
    {
      id: 'accounts',
      title: 'User Accounts and Registration',
      icon: <Users className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Creation</h3>
          <p className="mb-4">
            To use certain features of the Service, you must create an account. You may create an account by:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Registering with your email address</li>
            <li>Using third-party authentication (Google, GitHub)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Security</h3>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide accurate and complete registration information</li>
            <li>Keep your login credentials secure and confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Use strong passwords and enable two-factor authentication when available</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Termination</h3>
          <p className="mb-4">
            You may delete your account at any time through your account settings. Upon account deletion:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Your personal data will be deleted within 30 days</li>
            <li>Uploaded documents and bills will be permanently removed</li>
            <li>You will lose access to all Service features</li>
            <li>We may retain certain information as required by law</li>
          </ul>
        </>
      )
    },
    {
      id: 'usage-rules',
      title: 'Acceptable Use Policy',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Permitted Uses</h3>
          <p className="mb-4">You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service only to:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Manage your personal bills and financial documents</li>
            <li>Track warranties for items you own</li>
            <li>Organize and categorize your financial information</li>
            <li>Export your data for personal use</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prohibited Uses</h3>
          <p className="mb-4">You agree not to use the Service:</p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>For any unlawful purpose or to solicit others to take unlawful actions</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            <li>For any obscene or immoral purpose or to engage in commercial activities</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Content Guidelines</h3>
          <p className="mb-4">When uploading documents to the Service, you must ensure that:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>You have the legal right to upload and store the documents</li>
            <li>The documents do not contain illegal content</li>
            <li>The documents are your personal bills and financial records</li>
            <li>You do not upload copyrighted material belonging to others</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-ownership',
      title: 'Data Ownership and Intellectual Property',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Data</h3>
          <p className="mb-4">
            You retain ownership of all content and data that you upload to the Service, including bills, receipts, and personal information ("User Content"). By uploading User Content, you grant us a limited license to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Store and backup your content on our secure servers</li>
            <li>Process your content to provide Service features (OCR, categorization, etc.)</li>
            <li>Transmit your content back to you through the Service interface</li>
            <li>Create anonymized, aggregated statistics to improve our Service</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Intellectual Property</h3>
          <p className="mb-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property of Bill Vault and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Third-Party Content</h3>
          <p className="mb-4">
            The Service may include content provided by third parties, including materials provided by other users, bloggers, and third-party licensors. We do not control, endorse, or adopt any third-party content and will have no responsibility for third-party content.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Export</h3>
          <p>
            You have the right to export your data at any time through the Service interface. Upon account termination, you have 30 days to download your data before it is permanently deleted.
          </p>
        </>
      )
    },
    {
      id: 'privacy-security',
      title: 'Privacy and Security',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Protection</h3>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Privacy Policy</h3>
          <p className="mb-4">
            Our Privacy Policy describes how we collect, use, and protect your information when you use our Service. By using our Service, you agree that we can use such data in accordance with our Privacy Policy.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Security Incidents</h3>
          <p>
            In the event of a security incident that may affect your personal data, we will notify affected users within 72 hours of becoming aware of the incident, in accordance with applicable laws.
          </p>
        </>
      )
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Availability</h3>
          <p className="mb-4">
            We strive to provide a reliable service, but we cannot guarantee that the Service will be available at all times. The Service may be subject to temporary interruptions due to maintenance, updates, or technical issues.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Disclaimer of Warranties</h3>
          <p className="mb-4">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
            <li>Warranties that the Service will be uninterrupted, error-free, or secure</li>
            <li>Warranties regarding the accuracy or reliability of any information obtained through the Service</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Limitation of Liability</h3>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, in no event shall Bill Vault, its affiliates, agents, directors, employees, suppliers, or licensors be liable for any direct, indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Your use of or inability to use the Service</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through our Service</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the Service</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Indemnification</h3>
          <p>
            You agree to defend, indemnify, and hold harmless Bill Vault and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
          </p>
        </>
      )
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Termination by You</h3>
          <p className="mb-4">
            You may terminate your account at any time by deleting your account through the Service interface. Upon termination:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Your access to the Service will be immediately revoked</li>
            <li>Your data will be permanently deleted within 30 days</li>
            <li>You will receive a confirmation email when deletion is complete</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Termination by Us</h3>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. We may terminate accounts that:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Violate these Terms of Service</li>
            <li>Are used for illegal activities</li>
            <li>Remain inactive for extended periods</li>
            <li>Pose security risks to our Service or other users</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Effect of Termination</h3>
          <p>
            Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the Terms which by their nature should survive termination shall survive termination.
          </p>
        </>
      )
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Dispute Resolution',
      icon: <Scale className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Governing Law</h3>
          <p className="mb-4">
            These Terms shall be interpreted and governed by the laws of the United States and the State of California, without regard to its conflict of law provisions.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dispute Resolution</h3>
          <p className="mb-4">
            Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the commercial arbitration rules of the American Arbitration Association.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Class Action Waiver</h3>
          <p className="mb-4">
            You agree that any arbitration or proceeding shall be limited to the dispute between us and you individually. To the full extent permitted by law, no arbitration or proceeding shall be joined with another or proceed as a class action.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Severability</h3>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </>
      )
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
          <p className="mb-4">
            Material changes include but are not limited to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Changes to limitation of liability provisions</li>
            <li>Changes to dispute resolution procedures</li>
            <li>Changes to user rights and responsibilities</li>
            <li>Changes to data handling practices</li>
          </ul>
          <p className="mb-4">
            What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
          <p>
            If you do not agree to the new terms, please stop using the Service and delete your account.
          </p>
        </>
      )
    }
  ];

  return (
    <>
      <SEOHead
        title="Terms of Service - Bill Vault App Legal Agreement"
        description="Terms of Service for Bill Vault warranty tracker and bill management app. Understand your rights and responsibilities when using our digital receipt storage service."
        keywords="terms of service, bill vault terms, warranty tracker legal, bill management app terms, user agreement, app terms and conditions"
        url="https://billvault.silentthundersquad.in/terms-of-service"
        schema={breadcrumbSchema}
      />
      <div className="min-h-screen bg-gradient-to-b from-accent/5 via-transparent to-background">
      {/* Navigation Bar */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              <span className="text-lg font-bold text-foreground">Bill Vault</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy-policy"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          {...fadeInUp}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-card border border-border rounded-2xl shadow-lg">
              <Scale className="h-12 w-12 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Please read these terms carefully before using Bill Vault.
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: March 20, 2026
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          className="bg-card border border-border rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-accent">
                  {section.icon}
                </div>
                <span className="text-muted-foreground hover:text-foreground transition-colors">{section.title}</span>
              </a>
            ))}
          </nav>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              className="bg-card border border-border rounded-xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="text-accent">
                    {section.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none [&>*]:text-muted-foreground [&>h3]:text-foreground [&>p]:text-muted-foreground [&>ul]:text-muted-foreground [&>li]:text-muted-foreground">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          className="bg-accent/5 border border-accent/10 rounded-xl p-8 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Email:</strong> legal@billvault.com
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Subject Line:</strong> "Terms of Service Inquiry - Bill Vault"
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            We will respond to all legal inquiries within 30 days.
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}