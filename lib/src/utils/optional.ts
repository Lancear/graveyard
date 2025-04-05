/**
 * Nullish as defined by the JavaScript nullish coalescing operator.
 * `null` | `undefined`
 */
export type nullish = null | undefined;

export function isNullish<T>(value: T | null | undefined): value is nullish {
  return value === null || value === undefined;
}

export function notNullish<T>(
  value: T | null | undefined,
): value is NonNullable<T> {
  return !isNullish(value);
}

/**
 * Throws when this function receives a nullish value.
 * Use this when you know the value cannot be nullish, but TypeScript doesn't.
 *
 * @throws on `nullish` value
 */
export function neverNullish<T>(value: T, errorMessage?: string) {
  if (isNullish(value)) {
    throw new Error(
      errorMessage ?? "Invalid state, unexpected nullish value received!",
    );
  }

  return value as NonNullable<T>;
}
