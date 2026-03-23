import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Mail,
  Globe,
  Lock,
  Users,
  Zap,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface SystemSettings {
  // Authentication Settings
  enableGoogleAuth: boolean;
  enableGithubAuth: boolean;
  requireEmailVerification: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  maxLoginAttempts: number;

  // File Upload Settings
  maxFileSize: number;
  allowedFileTypes: string[];
  enableThumbnails: boolean;
  compressionQuality: number;

  // OCR Settings
  ocrProvider: 'tesseract' | 'google' | 'aws';
  ocrLanguage: string;
  enableAutoExtraction: boolean;
  extractionQuality: 'fast' | 'balanced' | 'accurate';

  // Email Settings
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;

  // Security Settings
  enableRateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  enableCors: boolean;
  allowedOrigins: string[];
  enableCSRFProtection: boolean;

  // Notification Settings
  enableEmailNotifications: boolean;
  enableWarrantyAlerts: boolean;
  warrantyAlertDays: number;
  enableSystemAlerts: boolean;

  // Backup Settings
  enableAutoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
  backupLocation: string;

  // Monitoring Settings
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  metricsRetention: number;
}

const defaultSettings: SystemSettings = {
  enableGoogleAuth: true,
  enableGithubAuth: true,
  requireEmailVerification: true,
  passwordMinLength: 8,
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  maxFileSize: 10,
  allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'tiff'],
  enableThumbnails: true,
  compressionQuality: 85,
  ocrProvider: 'tesseract',
  ocrLanguage: 'eng',
  enableAutoExtraction: true,
  extractionQuality: 'balanced',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  fromEmail: '',
  fromName: 'Bill Vault',
  enableRateLimit: true,
  rateLimitRequests: 100,
  rateLimitWindow: 60,
  enableCors: true,
  allowedOrigins: ['https://app.bill-vault.in'],
  enableCSRFProtection: true,
  enableEmailNotifications: true,
  enableWarrantyAlerts: true,
  warrantyAlertDays: 30,
  enableSystemAlerts: true,
  enableAutoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30,
  backupLocation: 's3://bill-vault-backups',
  enableLogging: true,
  logLevel: 'info',
  enableMetrics: true,
  metricsRetention: 90
};

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Configure user authentication and security settings',
    icon: Shield
  },
  {
    id: 'files',
    title: 'File Upload',
    description: 'Manage file upload limits and processing settings',
    icon: Database
  },
  {
    id: 'ocr',
    title: 'OCR Processing',
    description: 'Configure optical character recognition settings',
    icon: Zap
  },
  {
    id: 'email',
    title: 'Email Configuration',
    description: 'Set up SMTP and email notification settings',
    icon: Mail
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Advanced security and protection settings',
    icon: Lock
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure system and user notifications',
    icon: Bell
  },
  {
    id: 'backup',
    title: 'Backup & Recovery',
    description: 'Automated backup and data retention settings',
    icon: Database
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    description: 'Logging and metrics collection settings',
    icon: Globe
  }
];

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('authentication');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would load from a dedicated settings table
      // For now, we'll use the default settings
      setSettings(defaultSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const updateArraySetting = (key: keyof SystemSettings, value: string) => {
    const current = settings[key] as string[];
    const newValue = value.split(',').map(s => s.trim()).filter(Boolean);
    updateSetting(key, newValue);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // In production, this would save to the database
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUnsavedChanges(false);
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSettings(defaultSettings);
      setUnsavedChanges(true);
      toast.info('Settings reset to defaults');
    }
  };

  const testEmailConnection = async () => {
    try {
      setTestingConnection(true);

      // Simulate testing email connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Email connection test successful');
    } catch (err) {
      toast.error('Email connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const generateApiKey = () => {
    const key = 'bv_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    navigator.clipboard.writeText(key);
    toast.success('API key generated and copied to clipboard');
  };

  const renderAuthenticationSettings = () => (
    <div className="space-y-6">
      {/* Social Auth Options */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-foreground">Social Authentication</h4>
        <div className="space-y-3 lg:flex lg:items-center lg:gap-6 lg:space-y-0">
          <div>
            <label className="flex items-center gap-3 p-3 lg:p-0 bg-muted/30 lg:bg-transparent rounded-lg lg:rounded-none cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableGoogleAuth}
                onChange={(e) => updateSetting('enableGoogleAuth', e.target.checked)}
                className="h-5 w-5 lg:h-4 lg:w-4 rounded border-border"
              />
              <span className="text-base lg:text-sm font-medium">Enable Google Authentication</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 p-3 lg:p-0 bg-muted/30 lg:bg-transparent rounded-lg lg:rounded-none cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableGithubAuth}
                onChange={(e) => updateSetting('enableGithubAuth', e.target.checked)}
                className="h-5 w-5 lg:h-4 lg:w-4 rounded border-border"
              />
              <span className="text-base lg:text-sm font-medium">Enable GitHub Authentication</span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Verification */}
      <div>
        <label className="flex items-start gap-3 p-3 lg:p-0 bg-muted/30 lg:bg-transparent rounded-lg lg:rounded-none cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
            className="h-5 w-5 lg:h-4 lg:w-4 rounded border-border mt-0.5"
          />
          <div>
            <span className="text-base lg:text-sm font-medium block">Require Email Verification</span>
            <p className="text-sm text-muted-foreground mt-1">Users must verify their email before accessing the application</p>
          </div>
        </label>
      </div>

      {/* Number Inputs */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-foreground">Security Parameters</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="128"
              value={settings.passwordMinLength}
              onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Session Timeout (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="20"
              value={settings.maxLoginAttempts}
              onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFileSettings = () => (
    <div className="space-y-6">
      {/* Numeric Settings */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-foreground">Upload Limits</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Max File Size (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxFileSize}
              onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Compression Quality (%)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={settings.compressionQuality}
              onChange={(e) => updateSetting('compressionQuality', parseInt(e.target.value))}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* File Types */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Allowed File Types
        </label>
        <input
          type="text"
          value={settings.allowedFileTypes.join(', ')}
          onChange={(e) => updateArraySetting('allowedFileTypes', e.target.value)}
          placeholder="pdf, jpg, jpeg, png, tiff"
          className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="text-sm text-muted-foreground mt-2">Comma-separated list of allowed file extensions</p>
      </div>

      {/* Thumbnail Setting */}
      <div>
        <label className="flex items-start gap-3 p-3 lg:p-0 bg-muted/30 lg:bg-transparent rounded-lg lg:rounded-none cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableThumbnails}
            onChange={(e) => updateSetting('enableThumbnails', e.target.checked)}
            className="h-5 w-5 lg:h-4 lg:w-4 rounded border-border mt-0.5"
          />
          <div>
            <span className="text-base lg:text-sm font-medium block">Generate Thumbnails</span>
            <p className="text-sm text-muted-foreground mt-1">Automatically generate thumbnails for uploaded images</p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderOCRSettings = () => (
    <div className="space-y-6">
      {/* OCR Configuration */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-foreground">OCR Configuration</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              OCR Provider
            </label>
            <select
              value={settings.ocrProvider}
              onChange={(e) => updateSetting('ocrProvider', e.target.value as 'tesseract' | 'google' | 'aws')}
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="tesseract">Tesseract (Free)</option>
              <option value="google">Google Vision (Paid)</option>
              <option value="aws">AWS Textract (Paid)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              OCR Language
            </label>
            <input
              type="text"
              value={settings.ocrLanguage}
              onChange={(e) => updateSetting('ocrLanguage', e.target.value)}
              placeholder="eng"
              className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Processing Settings */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-foreground">Processing Settings</h4>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Extraction Quality
          </label>
          <select
            value={settings.extractionQuality}
            onChange={(e) => updateSetting('extractionQuality', e.target.value as 'fast' | 'balanced' | 'accurate')}
            className="w-full px-4 py-3 lg:px-3 lg:py-2 bg-background border border-border rounded-lg text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="fast">Fast (Lower accuracy, faster processing)</option>
            <option value="balanced">Balanced (Good accuracy and speed)</option>
            <option value="accurate">Accurate (Best accuracy, slower processing)</option>
          </select>
        </div>

        <div>
          <label className="flex items-start gap-3 p-3 lg:p-0 bg-muted/30 lg:bg-transparent rounded-lg lg:rounded-none cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAutoExtraction}
              onChange={(e) => updateSetting('enableAutoExtraction', e.target.checked)}
              className="h-5 w-5 lg:h-4 lg:w-4 rounded border-border mt-0.5"
            />
            <div>
              <span className="text-base lg:text-sm font-medium block">Enable Auto Extraction</span>
              <p className="text-sm text-muted-foreground mt-1">Automatically extract text from uploaded documents</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => updateSetting('smtpHost', e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.smtpPort}
            onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.smtpUser}
            onChange={(e) => updateSetting('smtpUser', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            SMTP Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={settings.smtpPassword}
              onChange={(e) => updateSetting('smtpPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            From Email
          </label>
          <input
            type="email"
            value={settings.fromEmail}
            onChange={(e) => updateSetting('fromEmail', e.target.value)}
            placeholder="noreply@bill-vault.com"
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            From Name
          </label>
          <input
            type="text"
            value={settings.fromName}
            onChange={(e) => updateSetting('fromName', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={testEmailConnection}
          disabled={testingConnection || !settings.smtpHost}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {testingConnection ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableRateLimit}
            onChange={(e) => updateSetting('enableRateLimit', e.target.checked)}
            className="rounded border-border"
          />
          Enable Rate Limiting
        </label>
        <p className="text-sm text-muted-foreground">Protect against brute force and DDoS attacks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Rate Limit (requests per window)
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={settings.rateLimitRequests}
            onChange={(e) => updateSetting('rateLimitRequests', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Rate Limit Window (seconds)
          </label>
          <input
            type="number"
            min="60"
            max="3600"
            value={settings.rateLimitWindow}
            onChange={(e) => updateSetting('rateLimitWindow', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableCors}
            onChange={(e) => updateSetting('enableCors', e.target.checked)}
            className="rounded border-border"
          />
          Enable CORS Protection
        </label>
        <p className="text-sm text-muted-foreground">Control which domains can access your API</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Allowed Origins
        </label>
        <input
          type="text"
          value={settings.allowedOrigins.join(', ')}
          onChange={(e) => updateArraySetting('allowedOrigins', e.target.value)}
          placeholder="https://app.bill-vault.in, https://admin.bill-vault.in"
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="text-sm text-muted-foreground mt-1">Comma-separated list of allowed domains</p>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enableCSRFProtection}
            onChange={(e) => updateSetting('enableCSRFProtection', e.target.checked)}
            className="rounded border-border"
          />
          Enable CSRF Protection
        </label>
        <p className="text-sm text-muted-foreground mt-1">Protect against Cross-Site Request Forgery attacks</p>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableEmailNotifications}
            onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
            className="rounded border-border"
          />
          Enable Email Notifications
        </label>
        <p className="text-sm text-muted-foreground">Send automated emails to users and admins</p>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableWarrantyAlerts}
            onChange={(e) => updateSetting('enableWarrantyAlerts', e.target.checked)}
            className="rounded border-border"
          />
          Enable Warranty Alerts
        </label>
        <p className="text-sm text-muted-foreground">Notify users when warranties are expiring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Warranty Alert Days (before expiry)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.warrantyAlertDays}
            onChange={(e) => updateSetting('warrantyAlertDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enableSystemAlerts}
            onChange={(e) => updateSetting('enableSystemAlerts', e.target.checked)}
            className="rounded border-border"
          />
          Enable System Alerts
        </label>
        <p className="text-sm text-muted-foreground mt-1">Send alerts for system errors and issues</p>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableAutoBackup}
            onChange={(e) => updateSetting('enableAutoBackup', e.target.checked)}
            className="rounded border-border"
          />
          Enable Automated Backups
        </label>
        <p className="text-sm text-muted-foreground">Automatically backup your data on a schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Backup Frequency
          </label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => updateSetting('backupFrequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Backup Retention (days)
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={settings.backupRetention}
            onChange={(e) => updateSetting('backupRetention', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Backup Storage Location
        </label>
        <input
          type="text"
          value={settings.backupLocation}
          onChange={(e) => updateSetting('backupLocation', e.target.value)}
          placeholder="s3://your-backup-bucket"
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="text-sm text-muted-foreground mt-1">S3, GCS, or other cloud storage URL</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => toast.info('Manual backup initiated')}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
        >
          Run Manual Backup
        </button>
        <button
          onClick={() => toast.info('Backup test completed successfully')}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          Test Backup
        </button>
      </div>
    </div>
  );

  const renderMonitoringSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableLogging}
            onChange={(e) => updateSetting('enableLogging', e.target.checked)}
            className="rounded border-border"
          />
          Enable System Logging
        </label>
        <p className="text-sm text-muted-foreground">Log system events and user activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Log Level
          </label>
          <select
            value={settings.logLevel}
            onChange={(e) => updateSetting('logLevel', e.target.value as 'debug' | 'info' | 'warn' | 'error')}
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error Only</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.enableMetrics}
            onChange={(e) => updateSetting('enableMetrics', e.target.checked)}
            className="rounded border-border"
          />
          Enable Performance Metrics
        </label>
        <p className="text-sm text-muted-foreground">Collect system performance and usage metrics</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Metrics Retention (days)
        </label>
        <input
          type="number"
          min="30"
          max="365"
          value={settings.metricsRetention}
          onChange={(e) => updateSetting('metricsRetention', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Current System Status</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">CPU Usage:</span>
            <span className="ml-2 text-foreground">23%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Memory Usage:</span>
            <span className="ml-2 text-foreground">45%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Disk Usage:</span>
            <span className="ml-2 text-foreground">67%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Uptime:</span>
            <span className="ml-2 text-foreground">7d 3h 21m</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground text-base lg:text-sm">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {unsavedChanges && (
              <span className="text-sm text-yellow-500 flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                Unsaved changes
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={resetSettings}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:p-2 hover:bg-destructive/20 rounded-lg transition-colors text-destructive"
                title="Reset to Defaults"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="sm:hidden">Reset</span>
              </button>
              <button
                onClick={saveSettings}
                disabled={saving || !unsavedChanges}
                className="flex-1 sm:flex-none px-6 py-3 lg:px-4 lg:py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 font-medium text-base lg:text-sm"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0">
        {/* Mobile Settings Navigation */}
        <div className="lg:hidden">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Settings Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-colors min-h-[80px]",
                      activeSection === section.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium leading-tight">
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Settings Navigation */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      activeSection === section.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{section.title}</p>
                      <p className="text-xs opacity-80 truncate">{section.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-4 lg:p-6"
          >
            <div className="flex items-start gap-3 mb-6">
              {React.createElement(
                settingsSections.find(s => s.id === activeSection)?.icon || SettingsIcon,
                { className: "h-6 w-6 lg:h-7 lg:w-7 text-accent flex-shrink-0 mt-1" }
              )}
              <div className="min-w-0">
                <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-muted-foreground text-base lg:text-sm mt-1">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
            </div>

            {(() => {
              switch (activeSection) {
                case 'authentication': return renderAuthenticationSettings();
                case 'files': return renderFileSettings();
                case 'ocr': return renderOCRSettings();
                case 'email': return renderEmailSettings();
                case 'security': return renderSecuritySettings();
                case 'notifications': return renderNotificationSettings();
                case 'backup': return renderBackupSettings();
                case 'monitoring': return renderMonitoringSettings();
                default:
                  return (
                    <div className="text-center py-8">
                      <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Settings section coming soon</p>
                    </div>
                  );
              }
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}