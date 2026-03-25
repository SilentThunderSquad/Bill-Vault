import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Receipt, Bell, LayoutDashboard } from 'lucide-react';

export function HeroSection() {
  const { user, loading } = useAuth();
  const isSignedIn = !loading && !!user;

  return (
    <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            <span className="text-xs sm:text-sm text-accent font-medium">Secure Digital Vault</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-tight mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Best{' '}
          <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Warranty Tracker App
          </span>{' '}
          - Never Lose a Warranty Again
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          The ultimate bill management app and warranty tracker. Upload your receipts, automatically extract invoice data with OCR technology, track warranty expiry dates for all your products, and receive smart alerts before warranties expire. Free digital receipt storage solution.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {isSignedIn ? (
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 h-11 sm:h-12 text-base">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 h-11 sm:h-12 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 text-base">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          className="relative mt-12 sm:mt-16 md:mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl shadow-accent/5">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
              {[
                { icon: Receipt, label: 'Bills Stored', value: '24' },
                { icon: Shield, label: 'Active Warranties', value: '18' },
                { icon: Bell, label: 'Alerts Set', value: '5' },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto mb-1 sm:mb-2" />
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {['MacBook Pro 16"', 'Samsung TV 55"', 'iPhone 15 Pro'].map((name) => (
                <div key={name} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                  <span className="text-xs sm:text-sm text-foreground truncate">{name}</span>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 ml-2">Active</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
