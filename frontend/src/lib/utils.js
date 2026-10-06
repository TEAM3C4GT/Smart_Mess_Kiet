import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard shadcn/ui classnames merging utility
 * Combines conditional classes via clsx and resolves Tailwind conflicts via tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
