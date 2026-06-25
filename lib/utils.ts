import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeName(str: string) {
  const clean = str.replaceAll('-', ' ');
  return clean.replace(/\b\w/g, letter => letter.toUpperCase())
}