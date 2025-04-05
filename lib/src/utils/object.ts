export function toEnumerable(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Set) {
    return value.values();
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      value.entries().map(([key, val]) => [
        String(key),
        toEnumerable(val[key]),
      ]),
    );
  }

  return Object.fromEntries(
    Object.getOwnPropertyNames(value).map((key) => [
      key,
      toEnumerable((value as Record<string, unknown>)[key]),
    ]),
  );
}
