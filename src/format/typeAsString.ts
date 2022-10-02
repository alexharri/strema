const trivialTypeOfs = new Set(["string", "number", "boolean", "undefined"]);

export function typeAsString(value: unknown) {
  if (value === null) return "null";

  const typeOf = typeof value;
  if (trivialTypeOfs.has(typeOf)) return typeOf;

  if (Array.isArray(value)) {
    return "array";
  }

  return "object";
}
