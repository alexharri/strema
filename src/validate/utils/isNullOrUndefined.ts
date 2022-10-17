export function isNullOrUndefined(value: unknown) {
  return typeof value === "undefined" || value === null;
}
