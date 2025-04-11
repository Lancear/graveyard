/**
 * Checks an array of rules and returns the first result that is not undefined.
 */
export function applyRules<
  // deno-lint-ignore no-explicit-any
  T extends (...args: any) => any,
  TArgs = Parameters<T>,
  TResult = ReturnType<T>,
>(rules: T[], args: TArgs) {
  let result: TResult | undefined = undefined;

  for (const rule of rules) {
    result = rule(...(args as Parameters<T>));
    if (result) break;
  }

  return result;
}
