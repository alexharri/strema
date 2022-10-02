import { typeAsString } from "../format/typeAsString";
import { StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";

/**
 * @returns empty string if valid
 */
export function validateString(
  value: unknown,
  rules: StringRule[],
  ctx: ValidationContext
): ValidationError | null {
  const isNotStringValue = typeof value !== "string";
  const isNullOrUndefined = value === undefined || value === null;

  if (!isNullOrUndefined && isNotStringValue) {
    return new ValidationError({
      message: `Expected string value, got ${typeAsString(value)}`,
      value,
      ctx,
    });
  }

  if (isNullOrUndefined) {
    return null;
  }

  /** @todo perform rule checks */

  return null;
}
