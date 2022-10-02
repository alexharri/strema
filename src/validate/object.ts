import { typeAsString } from "../format/typeAsString";
import { enforceExhaustive } from "../switch";
import { PropertyNode } from "../types/Ast";
import { validateArray } from "./array";
import { validatePrimitive } from "./primitive";

/**
 * @returns empty string if valid
 */
export function validateObject(
  obj: unknown,
  properties: PropertyNode[]
): string {
  const isNotObjectValue = typeof obj !== "object";
  const isNullOrUndefined = obj === undefined || obj === null;

  if (isNullOrUndefined) {
    return "";
  }

  if (isNotObjectValue) {
    return `Expected object value, got ${typeAsString(obj)}`;
  }

  for (const { key, value: valueSpec } of properties) {
    const { type } = valueSpec;
    const value = (obj as Record<string, unknown>)[key];
    switch (type) {
      case "object":
        return validateObject(value, valueSpec.properties);
      case "array":
        return validateArray(value as unknown[], valueSpec);
      case "primitive":
        return validatePrimitive(value, valueSpec);
      default:
        enforceExhaustive(type, "Unexpected value type");
    }
  }

  return "";
}
