import { ensureErrorInstance } from "./error.ts";

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
 * The `try` statement as an expression for easier access to result of an
 * expression, which might throw, after the try block.
 */
export function safeTry<T>(fn: () => T): SafeResult<T> {
  try {
    const data = fn();
    return { success: true, data } as const;
  } catch (err) {
    return { success: false, error: ensureErrorInstance(err) } as const;
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
    return { success: false, error: ensureErrorInstance(err) } as const;
  }
}
