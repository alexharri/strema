export function callNTimes(n: number, callback: () => void) {
  if (!Number.isFinite(n)) {
    throw new Error(`Expected valid number, got '${n}'`);
  }
  if (n < 0) return;
  for (let i = 0; i < n; i++) {
    callback();
  }
}
