import { typeAsString } from "../format/typeAsString";
import { enforceExhaustive } from "../switch";
import { ArrayNode } from "../types/Ast";
import { validateObject } from "./object";
import { validatePrimitive } from "./primitive";

/**
 * @returns empty string if valid
 */
export function validateArray(arr: unknown[], spec: ArrayNode): string {
  const isNullOrUndefined = arr === undefined || arr === null;

  if (isNullOrUndefined) {
    return "";
  }

  const isNotArray = !Array.isArray(arr);

  if (isNotArray) {
    return `Expected array, got ${typeAsString(arr)}`;
  }

  for (const value of arr) {
    const { type } = spec.value;
    switch (type) {
      case "object":
        return validateObject(value, spec.value.properties);
      case "array":
        return validateArray(value, spec.value);
      case "primitive":
        return validatePrimitive(value, spec.value);
      default:
        enforceExhaustive(type, "Unexpected value type");
    }
  }

  return "";
}
