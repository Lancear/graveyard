export function timeout(ms: number) {
  if (ms === 0) return Promise.resolve();

  // eslint-disable-next-line avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
