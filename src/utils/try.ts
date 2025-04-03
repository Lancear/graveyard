export type SafeResult<T> =
  | {
    success: false;
    error: Error;
    data?: undefined;
  }
  | {
    success: true;
    data: T;
    error?: undefined;
  };

/**
 * Ensures the thrown error is a proper error instance.
 */
export function ensureErrorType(error: unknown, nonErrorMessage?: string) {
  return error instanceof Error
    ? error
    : new Error(nonErrorMessage || "Non-error type thrown!", { cause: error });
}

/**
 * The `try` statement as an expression for easier access to result of an
 * expression, which might throw, after the try block.
 */
export function safeTry<T>(fn: () => T): SafeResult<T> {
  try {
    const data = fn();
    return { success: true, data } as const;
  } catch (err) {
    return { success: false, error: ensureErrorType(err) } as const;
  }
}

/**
 * The `try` statement as an expression for easier access to result of an async
 * expression, which might throw, after the try block.
 */
export async function safeTryAsync<T>(
  fn: () => Promise<T>,
): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { success: true, data } as const;
  } catch (err) {
    return { success: false, error: ensureErrorType(err) } as const;
  }
}
