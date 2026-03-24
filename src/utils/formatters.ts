import { format, formatDistanceToNow, differenceInDays, parseISO, isValid, addMonths } from 'date-fns';
import type { WarrantyStatus } from '@/types';
import { EXPIRING_SOON_DAYS } from './constants';

function safeParse(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function formatDate(date: string): string {
  const parsed = safeParse(date);
  return parsed ? format(parsed, 'MMM dd, yyyy') : 'Invalid date';
}

export function formatDateShort(date: string): string {
  const parsed = safeParse(date);
  return parsed ? format(parsed, 'dd/MM/yyyy') : 'Invalid date';
}

export function formatRelativeDate(date: string): string {
  const parsed = safeParse(date);
  return parsed ? formatDistanceToNow(parsed, { addSuffix: true }) : 'Invalid date';
}

export function getDaysRemaining(expiryDate: string): number {
  const parsed = safeParse(expiryDate);
  return parsed ? differenceInDays(parsed, new Date()) : 0;
}

export function getWarrantyStatus(expiryDate: string): WarrantyStatus {
  const days = getDaysRemaining(expiryDate);
  if (days < 0) return 'expired';
  if (days <= EXPIRING_SOON_DAYS) return 'expiring';
  return 'active';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateExpiryDate(purchaseDate: string, months: number): string {
  const parsed = safeParse(purchaseDate);
  if (!parsed) return '';
  const expiry = addMonths(parsed, months);
  return format(expiry, 'yyyy-MM-dd');
}
