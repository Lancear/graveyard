import { twMerge } from "tailwind-merge";

export function cls(...args: unknown[]) {
  return twMerge(args.filter((a) => a && typeof a === "string").join(" "));
}

export function toFixed(num: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(num * factor) / factor;
}

/**
 * Both min and max are inclusive.
 */
export function between(val: number, min: number, max: number) {
  return val >= min && val <= max;
}
