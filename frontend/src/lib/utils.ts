import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names, resolving conflicting Tailwind utility
 * classes (e.g. `p-2` vs `p-4`) in favor of the later one.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
