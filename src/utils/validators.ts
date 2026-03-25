import type { BillFormData } from '@/types';

// Security-focused input validation with length limits
const INPUT_LIMITS = {
  PRODUCT_NAME: { min: 1, max: 100 },
  BRAND: { min: 0, max: 50 },
  STORE_NAME: { min: 1, max: 100 },
  VENDOR_NAME: { min: 0, max: 100 },
  DESCRIPTION: { min: 0, max: 1000 },
  NOTES: { min: 0, max: 500 },
  TAGS: { min: 0, max: 200 }, // For comma-separated tags
  CATEGORY: { min: 1, max: 50 },
  MAX_PRICE: 10000000 // Max price: 10 million
} as const;

// Enhanced bill form validation with security checks
export function validateBillForm(data: BillFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Product name validation
  if (!data.product_name.trim()) {
    errors.product_name = 'Product name is required';
  } else if (data.product_name.length > INPUT_LIMITS.PRODUCT_NAME.max) {
    errors.product_name = `Product name must be less than ${INPUT_LIMITS.PRODUCT_NAME.max} characters`;
  } else if (containsMaliciousContent(data.product_name)) {
    errors.product_name = 'Product name contains invalid characters';
  }

  // Brand validation
  if (data.brand && data.brand.length > INPUT_LIMITS.BRAND.max) {
    errors.brand = `Brand must be less than ${INPUT_LIMITS.BRAND.max} characters`;
  } else if (data.brand && containsMaliciousContent(data.brand)) {
    errors.brand = 'Brand contains invalid characters';
  }

  // Store name validation
  if (!data.store_name.trim()) {
    errors.store_name = 'Store name is required';
  } else if (data.store_name.length > INPUT_LIMITS.STORE_NAME.max) {
    errors.store_name = `Store name must be less than ${INPUT_LIMITS.STORE_NAME.max} characters`;
  } else if (containsMaliciousContent(data.store_name)) {
    errors.store_name = 'Store name contains invalid characters';
  }

  // Vendor name validation
  if (data.vendor_name && data.vendor_name.length > INPUT_LIMITS.VENDOR_NAME.max) {
    errors.vendor_name = `Vendor name must be less than ${INPUT_LIMITS.VENDOR_NAME.max} characters`;
  } else if (data.vendor_name && containsMaliciousContent(data.vendor_name)) {
    errors.vendor_name = 'Vendor name contains invalid characters';
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Category is required';
  } else if (data.category.length > INPUT_LIMITS.CATEGORY.max) {
    errors.category = `Category must be less than ${INPUT_LIMITS.CATEGORY.max} characters`;
  }

  // Notes validation (this field exists in BillFormData)
  if (data.notes && data.notes.length > INPUT_LIMITS.NOTES.max) {
    errors.notes = `Notes must be less than ${INPUT_LIMITS.NOTES.max} characters`;
  }

  // Purchase date validation
  if (!data.purchase_date) {
    errors.purchase_date = 'Purchase date is required';
  } else {
    const purchaseDate = new Date(data.purchase_date);
    const now = new Date();
    if (purchaseDate > now) {
      errors.purchase_date = 'Purchase date cannot be in the future';
    }
  }

  // Warranty period validation
  if (data.has_warranty) {
    const months = parseInt(data.warranty_period_months);
    if (isNaN(months) || months < 0) {
      errors.warranty_period_months = 'Valid warranty period is required';
    } else if (months > 240) { // Max 20 years
      errors.warranty_period_months = 'Warranty period cannot exceed 240 months (20 years)';
    }
  }

  // Price validation with security checks
  const price = parseFloat(data.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Valid price is required';
  } else if (price > INPUT_LIMITS.MAX_PRICE) {
    errors.price = `Price cannot exceed ${INPUT_LIMITS.MAX_PRICE.toLocaleString()}`;
  }

  return errors;
}

// Check for malicious content patterns
function containsMaliciousContent(input: string): boolean {
  // Check for script tags, event handlers, and other XSS patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick/i,
    /onerror/i,
    /onload/i,
    /onmouseover/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}

// Enhanced password validation
export function validatePassword(password: string): { isValid: boolean; score: number; errors: string[] } {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score++; // Length requirement met
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score++;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score++;
  }

  // Additional security checks
  if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{3,}/i, // Repeated characters (aaaa, 1111)
    /123456|password|qwerty|abc123/i, // Common passwords
    /(012|123|234|345|456|567|678|789|890)/i // Sequential numbers
  ];

  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns that are easy to guess');
    score = Math.max(0, score - 1);
  }

  // Must meet all requirements for strong password
  const isValid = score >= 5 && errors.length === 0;

  return {
    isValid,
    score: Math.min(score, 5),
    errors
  };
}
