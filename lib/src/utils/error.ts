/**
 * Ensures the thrown error is a proper error instance.
 */
export function ensureErrorInstance(error: unknown, nonErrorMessage?: string) {
  return error instanceof Error
    ? error
    : new Error(nonErrorMessage || "Non-error type thrown!", { cause: error });
}
