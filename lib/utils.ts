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

export function formatEstateSize(val: string | undefined): string {
    const map: Record<string, string> = {
        under_500k:  'Under $500,000',
        '500k_to_1m':'$500,000 – $1,000,000',
        '1m_to_5m':  '$1,000,000 – $5,000,000',
        over_5m:     'Over $5,000,000',
        unknown:     'Unknown',
    };
    return val ? (map[val] ?? formatTitle(val)) : '—';
}

export function yesNo(val: boolean | null | undefined): string {
    if (val === null || val === undefined) return '—';
    return val ? 'Yes' : 'No';
}

export function greeting(localHour: number): string {
    if (localHour < 12) return 'Good morning';
    if (localHour < 17) return 'Good afternoon';
    return 'Good evening';
}