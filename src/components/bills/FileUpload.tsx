import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  mode: 'upload' | 'camera';
  acceptedTypes?: 'image' | 'pdf' | 'both';
}

export function FileUpload({ onFileSelect, mode, acceptedTypes = 'both' }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptAttr = () => {
    switch (acceptedTypes) {
      case 'image':
        return 'image/*';
      case 'pdf':
        return '.pdf,application/pdf';
      case 'both':
      default:
        return 'image/*,.pdf,application/pdf';
    }
  };

  const isFileTypeAllowed = (file: File) => {
    switch (acceptedTypes) {
      case 'image':
        return file.type.startsWith('image/');
      case 'pdf':
        return file.type === 'application/pdf';
      case 'both':
      default:
        return file.type.startsWith('image/') || file.type === 'application/pdf';
    }
  };

  // Enhanced file security validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!isFileTypeAllowed(file)) {
      return { isValid: false, error: 'Invalid file type. Only images and PDFs are allowed.' };
    }

    // Check file size (10MB limit for security)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size too large. Maximum size is 10MB.' };
    }

    // Check for minimum file size (prevent empty files)
    if (file.size < 100) {
      return { isValid: false, error: 'File too small. Minimum size is 100 bytes.' };
    }

    // Additional security: Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const validPdfExtensions = ['pdf'];

    if (file.type.startsWith('image/') && !validImageExtensions.includes(extension)) {
      return { isValid: false, error: 'Image file extension does not match file type.' };
    }

    if (file.type === 'application/pdf' && !validPdfExtensions.includes(extension)) {
      return { isValid: false, error: 'PDF file extension does not match file type.' };
    }

    // Check for malicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|zip|rar)$/i,
      /[<>"|*?]/,
      /../, // Path traversal
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return { isValid: false, error: 'Invalid file name contains suspicious patterns.' };
    }

    return { isValid: true };
  };

  const handleFile = useCallback((file: File) => {
    const validation = validateFile(file);

    if (!validation.isValid) {
      alert(validation.error || 'File validation failed');
      return;
    }

    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFileType('pdf');
      setPreview(null); // PDFs don't have image previews
    }

    onFileSelect(file);
  }, [onFileSelect, acceptedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setFileType(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileTypeDisplay = () => {
    if (fileName) {
      const extension = fileName.split('.').pop()?.toUpperCase();
      return extension || 'File';
    }
    return fileType === 'pdf' ? 'PDF' : 'Image';
  };

  const getSupportedTypesText = () => {
    switch (acceptedTypes) {
      case 'image':
        return 'Supports JPG, PNG, WebP up to 10MB';
      case 'pdf':
        return 'Supports PDF files up to 10MB';
      case 'both':
      default:
        return 'Supports JPG, PNG, WebP, PDF up to 10MB';
    }
  };

  if (fileName) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl border-2 border-accent/30 overflow-hidden bg-muted/20"
      >
        <div className="p-3 sm:p-4 bg-accent/5 border-b border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-full bg-accent/10">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {getFileTypeDisplay()} uploaded
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-xs">
                {fileName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>

        <div className="p-2 sm:p-4 flex justify-center bg-muted/10">
          {fileType === 'image' && preview ? (
            <img
              src={preview}
              alt="Bill preview"
              className="max-h-64 sm:max-h-80 object-contain rounded-lg shadow-sm"
            />
          ) : fileType === 'pdf' ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="p-4 sm:p-6 rounded-2xl bg-accent/10 mb-4">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">PDF Ready for Processing</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Extract Text" to process this PDF
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`relative rounded-xl transition-all duration-200 ${
        dragActive
          ? 'border-2 border-accent bg-accent/5 shadow-lg shadow-accent/10'
          : 'border-2 border-dashed border-muted-foreground/25 hover:border-accent/50 bg-muted/20 hover:bg-muted/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptAttr()}
        capture={mode === 'camera' ? 'environment' : undefined}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 sm:gap-5 py-8 sm:py-12 px-4">
        <div className={`p-4 sm:p-5 rounded-2xl transition-colors ${
          dragActive ? 'bg-accent/15' : 'bg-muted'
        }`}>
          {mode === 'camera' ? (
            <Camera className={`h-8 w-8 sm:h-10 sm:w-10 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
          ) : acceptedTypes === 'pdf' ? (
            <FileText className={`h-8 w-8 sm:h-10 sm:w-10 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
          ) : (
            <div className="flex gap-2">
              <ImageIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
              <FileText className={`h-6 w-6 sm:h-8 sm:w-8 ${dragActive ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-base sm:text-lg font-medium text-foreground">
            {mode === 'camera'
              ? 'Take a photo of your bill'
              : acceptedTypes === 'pdf'
                ? 'Drop your PDF bill here'
                : 'Drop your bill file here'
            }
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === 'camera'
              ? 'Use your camera to capture the bill'
              : getSupportedTypesText()
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'upload' && (
            <>
              <div className="h-px w-10 sm:w-16 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px w-10 sm:w-16 bg-border" />
            </>
          )}
        </div>

        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => fileInputRef.current?.click()}
          className={`h-11 px-6 text-sm font-medium gap-2 ${
            mode === 'camera' ? 'bg-accent hover:bg-accent/90' : ''
          }`}
        >
          {mode === 'camera' ? (
            <>
              <Camera className="h-4 w-4" />
              Open Camera
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Browse Files
            </>
          )}
        </Button>
      </div>
    </div>
  );
}