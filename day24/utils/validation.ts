import type { ActivityFormData } from '@/types';
import { getMinutesBetween } from '@/utils/time';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateActivity(data: ActivityFormData): ValidationResult {
  if (!data.title.trim()) {
    return { valid: false, error: 'Activity title is required' };
  }

  if (!data.category_id) {
    return { valid: false, error: 'Please select a category' };
  }

  if (data.end_time <= data.start_time) {
    return { valid: false, error: 'End time must be after start time' };
  }

  const duration = getMinutesBetween(data.start_time, data.end_time);
  if (duration > 24 * 60) {
    return { valid: false, error: 'Activity cannot exceed 24 hours' };
  }

  if (data.productivity_rating !== undefined) {
    if (data.productivity_rating < 1 || data.productivity_rating > 5) {
      return { valid: false, error: 'Productivity rating must be between 1 and 5' };
    }
  }

  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email)) return { valid: false, error: 'Please enter a valid email' };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  return { valid: true };
}

export function getFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('invalid login')) return 'Invalid email or password';
    if (message.includes('email not confirmed')) {
      return 'Email confirmation is still enabled in Supabase. Turn off Confirm email in Auth settings.';
    }
    if (message.includes('user already registered')) return 'An account with this email already exists';
    if (message.includes('network')) return 'Network error. Please check your connection.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
