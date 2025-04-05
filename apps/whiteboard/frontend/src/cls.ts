export function cls(...args: unknown[]) {
  return args.filter((a) => a && typeof a === "string").join(" ");
}
