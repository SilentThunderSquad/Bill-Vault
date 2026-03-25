# Bill Vault 🧾

**A modern, intelligent bill management system with warranty tracking, OCR scanning, and comprehensive admin dashboard.**

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Project Description

Bill Vault is a **production-ready SaaS application** that revolutionizes how individuals and businesses manage their bills, receipts, and warranties. Built with modern web technologies, it offers intelligent OCR scanning, automatic warranty tracking, real-time notifications, and a comprehensive admin dashboard for SaaS operations.

**Why Bill Vault?**
- 📱 **Never lose a receipt again** - Cloud-based storage with smart categorization
- 🔍 **Instant text extraction** - OCR technology extracts data from images and PDFs
- ⏰ **Warranty alerts** - Never miss warranty expirations with smart notifications
- 📊 **Analytics & insights** - Track spending patterns and manage finances
- 👑 **Admin dashboard** - Complete SaaS management system with user and system analytics

---

## ✨ Features

### 🔥 Core Features
- **📄 Bill Storage & Management** - Secure cloud storage for all your bills and receipts
- **🔍 OCR Text Extraction** - Automatic data extraction from images and PDFs using Tesseract.js
- **⚠️ Warranty Tracking** - Intelligent warranty expiry monitoring with configurable alerts
- **📱 Progressive Web App** - Full PWA with offline support and native-like experience
- **🔔 Real-time Notifications** - Multi-channel notifications (in-app, toast, PWA push)
- **📊 User Dashboard** - Interactive charts, analytics, and activity tracking
- **🔎 Advanced Search** - Filter bills by category, date, amount, vendor, and more

### 🚀 Advanced Features
- **👑 Complete Admin System** - Full-featured admin dashboard for SaaS operations
- **🔐 Role-Based Access Control** - Admin/super_admin roles with granular permissions
- **📈 System Analytics** - Real-time metrics, user analytics, and growth tracking
- **🗃️ Storage Management** - File monitoring, cleanup tools, and usage analytics
- **📋 Activity Logging** - Complete audit trail for compliance and security
- **🌐 Multi-tenant Ready** - Built for SaaS with user isolation and admin controls

### 🎨 User Experience
- **🌓 Dark/Light Themes** - Beautiful, accessible design with theme switching
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **⚡ Fast Performance** - Code splitting, lazy loading, and optimized bundles
- **🔒 Secure Authentication** - OAuth providers + email/password with Supabase Auth

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19.2.4** with **TypeScript 5.9.3**
- **Vite 7.3.1** - Lightning-fast build tool
- **Tailwind CSS 4.2.1** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Framer Motion 12.36.0** - Smooth animations and transitions
- **React Router DOM 7.13.1** - Client-side routing

### **Backend & Database**
- **Supabase** - PostgreSQL + Authentication + Storage
- **Row Level Security (RLS)** - Database-level security policies
- **Edge Functions** - Serverless functions for background tasks
- **Real-time Subscriptions** - Live data updates

### **OCR & File Processing**
- **Tesseract.js 7.0.0** - Client-side OCR for images
- **PDF.js 4.0.379** - PDF text extraction
- **File Upload** - Secure file handling with size limits

### **Analytics & UI**
- **Recharts 3.8.0** - Interactive data visualizations
- **Lucide React 0.577.0** - Beautiful icon library
- **Sonner 2.0.7** - Toast notifications
- **Next Themes 0.4.6** - Theme management

### **PWA & Performance**
- **Vite PWA 1.2.0** - Progressive Web App capabilities
- **Workbox** - Service worker and caching strategies
- **Code Splitting** - Optimized bundle loading

---

## 📁 Folder Structure

```
Bill-Vault/
├── 📁 src/
│   ├── 📁 assets/              # Static images and icons
│   ├── 📁 components/          # React components
│   │   ├── 📁 admin/           # Complete admin dashboard system
│   │   ├── 📁 auth/            # Authentication components
│   │   ├── 📁 bills/           # Bill management components
│   │   ├── 📁 dashboard/       # User dashboard widgets
│   │   ├── 📁 common/          # Shared/reusable components
│   │   ├── 📁 layout/          # Layout and navigation
│   │   └── 📁 ui/              # shadcn/ui component library
│   ├── 📁 context/             # React contexts (Auth, Admin, Theme)
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 pages/               # Application pages/routes
│   │   └── 📁 admin/           # Admin dashboard pages
│   ├── 📁 services/            # Business logic and API services
│   ├── 📁 types/               # TypeScript type definitions
│   └── 📁 utils/               # Helper functions and utilities
├── 📁 supabase/                # Database schema and functions
│   ├── 📄 user.sql             # Core user system schema
│   ├── 📄 admin.sql            # Admin system schema
│   └── 📁 functions/           # Edge functions
├── 📁 public/                  # Static assets and PWA manifest
├── 📁 scripts/                 # Build scripts (sitemap, icons)
└── 📁 dist/                    # Production build output
```

---

## ✅ Prerequisites

Before setting up Bill Vault, ensure you have:

- **Node.js 18.x or 20.x** - [Download here](https://nodejs.org/)
- **npm 8+** or **yarn 1.22+** - Package manager
- **Supabase Account** - [Sign up free](https://supabase.com/)
- **Git** - Version control
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

> 💡 **Tip**: Use Node Version Manager (nvm) to manage multiple Node.js versions easily

---

## 🚀 Installation

### **Step 1: Clone Repository**

```bash
# Clone the repository
git clone https://github.com/your-username/bill-vault.git

# Navigate to project directory
cd bill-vault
```

### **Step 2: Install Dependencies**

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### **Step 3: Environment Variables**

Create a `.env` file in the root directory:

```bash
# Create environment file
touch .env
```

Add the following variables to your `.env` file:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For development
NODE_ENV=development
```

> 📝 **Getting Supabase Keys**: Find these in your Supabase project dashboard under **Settings** → **API**

### **Step 4: Database Setup**

**Important**: Run these SQL files **in order** in your Supabase SQL editor:

1. **First, run the user system**:
   ```bash
   # Copy content from supabase/user.sql and run in Supabase SQL editor
   ```

2. **Then, run the admin system**:
   ```bash
   # Copy content from supabase/admin.sql and run in Supabase SQL editor
   ```

**What these scripts create:**
- **user.sql**: Core tables, RLS policies, storage buckets, user functions
- **admin.sql**: Admin system, analytics tables, admin functions, audit logging

### **Step 5: Supabase Storage Setup**

The SQL scripts automatically create these storage buckets:
- **bill-images**: For storing bill files (10MB limit)
- **avatars**: For user profile pictures (2MB limit)

Verify buckets exist in **Storage** section of your Supabase dashboard.

### **Step 6: Run the Application**

```bash
# Start development server
npm run dev

# Or using yarn
yarn dev
```

Your application will be available at: **http://localhost:5173**

---

## 🔧 Environment Variables

### **Required Variables**

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client-side | Supabase Dashboard → Settings → API |

### **Optional Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `VITE_APP_TITLE` | Application title | `Bill Vault` |

### **Example .env File**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Settings
NODE_ENV=development
```

> ⚠️ **Security Note**: Never commit your `.env` file to version control. It's already in `.gitignore`.

---

## 🗄️ Database Setup

### **Two-Phase Setup Process**

Bill Vault uses a **two-phase database setup** for security and modularity:

#### **Phase 1: User System (`user.sql`)**
```sql
-- Creates core functionality:
-- ✅ User profiles and authentication
-- ✅ Bills table with warranty tracking
-- ✅ Notifications system
-- ✅ Storage buckets and policies
-- ✅ User-level RLS policies
```

#### **Phase 2: Admin System (`admin.sql`)**
```sql
-- Creates admin functionality:
-- ✅ Role-based access control
-- ✅ Admin dashboard tables
-- ✅ System analytics
-- ✅ Activity logging
-- ✅ Admin-only functions
```

### **Setup Instructions**

1. **Open Supabase SQL Editor**: Go to your project → SQL Editor
2. **Run user.sql first**: Copy and paste content, then click "Run"
3. **Run admin.sql second**: Copy and paste content, then click "Run"
4. **Verify setup**: Check that tables exist in Database → Tables

### **Troubleshooting Database Setup**

If you encounter errors:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Test RLS policies
SELECT * FROM user_profiles LIMIT 1;
```

---

## 🏃 Run Project

### **Development Server**

```bash
# Start development server with hot reload
npm run dev

# With specific port
npm run dev -- --port 3000

# With host binding (for network access)
npm run dev -- --host
```

**Development Features:**
- ⚡ Hot Module Replacement (HMR)
- 🔍 Source maps for debugging
- 📝 TypeScript compilation
- 🎨 Tailwind CSS compilation

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Create production build
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Utilities
npm run generate-sitemap # Generate sitemap.xml
```

### **First Run Checklist**

✅ Environment variables are set
✅ Database scripts have run successfully
✅ Supabase project is active
✅ Dependencies are installed
✅ Development server starts without errors

---

## 🏗️ Build & Deploy

### **Production Build**

```bash
# Create optimized production build
npm run build

# Preview the build locally
npm run preview
```

**Build Output:**
```
dist/
├── assets/           # Optimized JS/CSS bundles
├── images/           # Optimized images
├── manifest.json     # PWA manifest
├── sw.js            # Service worker
└── index.html       # Main HTML file
```

### **Deployment Options**

#### **🔥 Vercel (Recommended)**

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add your `.env` variables in Vercel dashboard
3. **Deploy**: Automatic deployment on git push

**Vercel Configuration** (automatic):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### **🌐 Netlify**

1. **Connect Repository**: Link GitHub repo
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add in site settings

#### **☁️ Other Platforms**

Bill Vault works on any static hosting platform:
- **GitHub Pages** (with GitHub Actions)
- **Firebase Hosting**
- **Railway**
- **DigitalOcean App Platform**

### **Environment Variables for Production**

Ensure these are set in your deployment platform:

```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
NODE_ENV=production
```

> 🔄 **Important**: Redeploy after changing environment variables (Vite bakes them at build time)

---

## 👑 Admin Access

### **Creating Admin Users**

Once your application is running, you need to create admin users to access the admin dashboard.

#### **Step 1: Register a Regular User**
1. Visit your app and register a new account
2. Complete the profile setup

#### **Step 2: Make User an Admin**

Run these SQL commands in Supabase SQL Editor:

```sql
-- Make a user an admin
SELECT make_user_admin('user-uuid-here');

-- Make a user a super admin (full access)
SELECT make_user_super_admin('user-uuid-here');

-- Check user roles
SELECT * FROM user_roles WHERE user_id = 'user-uuid-here';
```

**Finding User ID:**
```sql
-- Find user ID by email
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';
```

#### **Step 3: Access Admin Dashboard**

1. **Login as admin**: Use your admin account credentials
2. **Navigate to admin**: Visit `/admin` route
3. **Enjoy full access**: Complete SaaS management system

### **Admin Dashboard Features**

Once logged in as admin, you'll have access to:

- **📊 Overview Dashboard** - System metrics, user activity, bills analytics
- **👥 User Management** - View, suspend, activate, delete users
- **📄 Bill Management** - Monitor all bills, file operations, bulk actions
- **📈 System Analytics** - Growth metrics, revenue tracking, usage stats
- **📋 Activity Logs** - Complete audit trail with CSV export
- **💾 Storage Management** - File monitoring, cleanup, usage analytics
- **⚙️ Settings** - System-wide configuration and policies

### **Role Permissions**

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| View Analytics | ✅ | ✅ |
| User Management | ✅ | ✅ |
| Bill Management | ✅ | ✅ |
| Activity Logs | ✅ | ✅ |
| System Settings | ❌ | ✅ |
| User Role Management | ❌ | ✅ |
| Delete Operations | ❌ | ✅ |

---

## 📱 PWA Usage

Bill Vault is a **Progressive Web App** that works like a native mobile app!

### **Installing the App**

#### **On Desktop (Chrome/Edge):**
1. Visit your Bill Vault site
2. Look for install icon in address bar
3. Click **"Install Bill Vault"**
4. App appears in your applications

#### **On Mobile (iOS/Android):**
1. Open site in Safari (iOS) or Chrome (Android)
2. Tap **Share** button
3. Select **"Add to Home Screen"**
4. App icon appears on home screen

### **PWA Features**

- **🚀 Fast Loading** - Instant app startup
- **📱 Native Feel** - Full-screen experience
- **🔔 Push Notifications** - Warranty alerts and updates
- **💾 Offline Support** - Basic functionality without internet
- **🎯 App Shortcuts** - Quick actions from app icon
- **📲 Native Sharing** - Share bills and data easily

### **App Shortcuts**

Long-press the app icon for quick actions:
- **Add Bill** - Directly open bill upload
- **My Bills** - Go straight to your bills
- **Dashboard** - View your dashboard

### **Notification Features**

- **Warranty Alerts** - Never miss warranty expirations
- **System Updates** - Important system announcements
- **Activity Notifications** - Bill processing updates

---

## 🔍 SEO & Google Setup (Optional)

Bill Vault includes comprehensive SEO optimization for better search engine visibility.

### **Included SEO Features**

- **📄 Meta Tags** - Title, description, keywords
- **🌐 Open Graph** - Social media sharing optimization
- **🐦 Twitter Cards** - Twitter sharing enhancement
- **📋 JSON-LD Schema** - Structured data for search engines
- **🗺️ Sitemap.xml** - Automatic sitemap generation
- **🤖 Robots.txt** - Search engine directives

### **Sitemap Generation**

```bash
# Generate sitemap manually
npm run generate-sitemap

# Sitemap is automatically generated on build
npm run build
```

**Sitemap includes:**
- All public pages
- Admin login page
- Legal pages (Privacy, Terms)
- Updated timestamps

### **Google Search Console Setup**

1. **Verify Domain**: Add your domain to Google Search Console
2. **Submit Sitemap**: Submit `yoursite.com/sitemap.xml`
3. **Monitor**: Track indexing and performance

### **Custom SEO Configuration**

Edit SEO settings in `src/components/common/SEO.tsx`:

```typescript
// Customize default SEO values
const defaultSEO = {
  title: "Your Bill Vault Title",
  description: "Your custom description",
  keywords: "bills, receipts, warranty tracking",
  // ... other settings
};
```

---

## 🤝 Contributing

We welcome contributions to Bill Vault! Here's how you can help:

### **Getting Started**

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/SilentThunderSquad/Bill-Vault
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run lint        # Check code style
   npm run type-check  # Verify TypeScript
   npm run build       # Test production build
   ```

5. **Commit and Push**
   ```bash
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Describe your changes clearly
   - Include screenshots for UI changes
   - Reference any related issues

### **Code Style Guidelines**

- **TypeScript**: Use strict typing, avoid `any`
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS classes, avoid inline styles
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: Document complex logic and business rules

### **Reporting Issues**

When reporting bugs:

1. **Check existing issues** first
2. **Use the bug template**
3. **Include steps to reproduce**
4. **Add screenshots/videos** if applicable
5. **Specify environment** (browser, OS, Node version)

### **Feature Requests**

For new features:

1. **Check roadmap** and existing requests
2. **Describe the problem** you're solving
3. **Propose a solution** with examples
4. **Consider the impact** on existing users

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means:**

- ✅ **Commercial Use** - Use in commercial projects
- ✅ **Modification** - Modify the source code
- ✅ **Distribution** - Distribute copies
- ✅ **Private Use** - Use privately
- ✅ **Patent Grant** - Explicit patent rights

**Requirements:**
- Include the original license and copyright notice
- Changes must be documented

---

## 👨‍💻 Author

**Project Owner**: [Silent Thunder Squad](https://github.com/SilentThunderSquad)

- 🌐 **Website**: [silentthundersquad.in](https://silentthundersquad.in)


---

## 🚀 What's Next?

### **Upcoming Features**

- **📊 Advanced Analytics** - More detailed reporting and insights
- **💳 Payment Integration** - Stripe/PayPal for SaaS billing
- **🔗 API Access** - REST API for third-party integrations
- **📱 Mobile Apps** - Native iOS and Android applications
- **🤖 AI Features** - Smart categorization and expense predictions
- **🔄 Data Import/Export** - CSV, JSON, and other format support

### **Community**

- **⭐ Star this repo** if you find it useful
- **🐛 Report issues** to help improve the project
- **💡 Suggest features** for future development
- **🤝 Contribute code** and become a contributor

---

## 📞 Support

Need help? Here are your options:

### **Self-Help Resources**

1. **📖 Documentation** - This README covers most scenarios
2. **💬 Discussions** - Check GitHub Discussions for Q&A
3. **🐛 Issues** - Search existing issues for solutions
4. **📝 Code Comments** - Well-documented codebase

### **Getting Help**

1. **🔍 Search first** - Check if your question was already answered
2. **📋 Use templates** - Follow issue/discussion templates
3. **🧾 Provide details** - Include error messages, screenshots, environment info
4. **✅ Be specific** - Describe what you expected vs. what happened

### **Professional Support**

For businesses needing professional support, custom development, or consulting services, please contact [your.email@example.com](mailto:your.email@example.com).

---

**Built with ❤️ using React, TypeScript, and Supabase**

*Ready to revolutionize your bill management? Star this repo and start building!* ⭐
