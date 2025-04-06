export type RefContainer<T> = { ref: T };

// eslint-disable-next-line no-redeclare
export function createRef<T>(
  initialValue?: undefined,
): RefContainer<T | undefined>;
// eslint-disable-next-line no-redeclare
export function createRef<T>(initialValue: T): RefContainer<T>;
export function createRef<T>(
  initialValue?: T,
): RefContainer<T> | RefContainer<T | undefined> {
  return { ref: initialValue };
}
