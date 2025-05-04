import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first name from a full name string
 * @param {string} fullName - The full name (e.g., "John", "Richard R Wineer")
 * @returns {string} - The extracted first name
 */
export function extractFirstName(fullName: string) {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}