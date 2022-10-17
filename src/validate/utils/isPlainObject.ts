export function isPlainObject(value: unknown) {
  return value?.constructor === Object;
}
