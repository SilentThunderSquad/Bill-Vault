import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 sm:py-12 px-4" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-accent" />
              <span className="text-lg font-bold text-foreground">Bill Vault</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
              The ultimate warranty tracker app and bill management solution. Store receipts, track warranties, never miss expiry dates.
            </p>
          </div>

          {/* Features Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-foreground mb-4">App Features</h3>
            <nav className="space-y-2">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                OCR Bill Scanner
              </a>
              <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Warranty Tracking
              </a>
              <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Digital Receipt Storage
              </Link>
              <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Smart Notifications
              </Link>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-foreground mb-4">Legal & Support</h3>
            <nav className="space-y-2">
              <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Account Login
              </Link>
              <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create Account
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Bill Vault - Best warranty tracker and bill management app. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
