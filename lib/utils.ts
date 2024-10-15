import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeFilename(input: string): string {
  return input.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
