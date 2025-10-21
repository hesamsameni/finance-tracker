// utils/date.ts
import { parseISO, isValid } from "date-fns";

/**
 * Normalize input to a JS Date object.
 * Accepts: "yyyy-MM-dd" string, ISO string, Date object.
 * Falls back to `new Date()` when input is missing/invalid.
 */
export function toDate(input?: string | Date): Date {
  if (!input) return new Date();
  if (input instanceof Date) {
    return isValid(input) ? input : new Date();
  }
  // if it's a string - try parseISO first, otherwise fallback to Date constructor
  try {
    const dt = parseISO(input);
    if (isValid(dt)) return dt;
  } catch (e) {
    // ignore
  }
  const dt2 = new Date(input);
  return isValid(dt2) ? dt2 : new Date();
}

/**
 * Return a yyyy-MM-dd string for safe query keys.
 */
export function toYmd(input?: string | Date): string {
  const { format } = require("date-fns"); // lazy import so it works in SSR
  return format(toDate(input), "yyyy-MM-dd");
}
