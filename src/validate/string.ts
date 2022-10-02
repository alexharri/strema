import { typeAsString } from "../format/typeAsString";
import { StringRule } from "../types/Rule";

/**
 * @returns empty string if valid
 */
export function validateString(value: unknown, rules: StringRule[]): string {
  const isNotStringValue = typeof value !== "string";
  const isNullOrUndefined = value === undefined || value === null;

  if (!isNullOrUndefined && isNotStringValue) {
    return `Expected string value, got ${typeAsString(value)}`;
  }

  if (isNullOrUndefined) {
    return "";
  }

  /** @todo perform rule checks */

  return "";
}
