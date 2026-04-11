import { clsx, type ClassValue } from 'clsx';

/**
 * Merges conditional class names (no Tailwind — use with CSS modules or plain strings).
 */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
