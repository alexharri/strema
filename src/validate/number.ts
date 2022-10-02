import { typeAsString } from "../format/typeAsString";
import { NumberRule } from "../types/Rule";

/**
 * @returns empty string if valid
 */
export function validateNumber(value: unknown, rules: NumberRule[]): string {
  const isNotNumberValue = typeof value !== "number";
  const isNullOrUndefined = value === undefined || value === null;

  if (!isNullOrUndefined && isNotNumberValue) {
    return `Expected number value, got ${typeAsString(value)}`;
  }

  if (isNullOrUndefined) {
    return "";
  }

  if (!isNullOrUndefined && !Number.isFinite(value)) {
    return `Expected finite number value, got ${value}`;
  }

  /** @todo perform rule checks */

  return "";
}
