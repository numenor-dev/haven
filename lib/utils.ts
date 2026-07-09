import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeName(str: string) {
  const clean = str.replaceAll('-', ' ');
  return clean.replace(/\b\w/g, letter => letter.toUpperCase())
}

/** Title Case display label */
export function formatTitle(val: string | null | undefined): string {
    if (!val) return '—';
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(val: Date | string | null | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatExpenses(val: string | undefined): string {
    const map: Record<string, string> = {
        under_10k:    'Under $10,000',
        '10k_to_50k': '$10,000 – $50,000',
        '50k_to_100k':'$50,000 – $100,000',
        over_100k:    'Over $100,000',
        unknown:      'Unknown',
    };
    return val ? (map[val] ?? formatTitle(val)) : '—';
}

export function yesNo(val: boolean | null | undefined): string {
    if (val === null || val === undefined) return '—';
    return val ? 'Yes' : 'No';
}