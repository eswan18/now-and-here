import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type PlainObject = Record<string, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export function deepEqual<T extends PlainObject | Date>(
  obj1: T,
  obj2: T,
): boolean {
  if (obj1 === obj2) return true;

  // Special cases: nulls, dates
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }
  if (obj1 instanceof Date || obj2 instanceof Date) {
    if (!(obj1 instanceof Date && obj2 instanceof Date)) {
      return false;
    }
    return obj1.getTime() === obj2.getTime();
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
