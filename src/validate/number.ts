import { typeAsString } from "../format/typeAsString";
import { NumberRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import ValidationError from "./ValidationError";

/**
 * @returns empty string if valid
 */
export function validateNumber(
  value: unknown,
  rules: NumberRule[],
  ctx: ValidationContext
): ValidationError | null {
  const isNotNumberValue = typeof value !== "number";
  const isNullOrUndefined = value === undefined || value === null;

  if (!isNullOrUndefined && isNotNumberValue) {
    return new ValidationError({
      message: `Expected number value, got ${typeAsString(value)}`,
      value,
      ctx,
    });
  }

  if (isNullOrUndefined) {
    return null;
  }

  if (!isNullOrUndefined && !Number.isFinite(value)) {
    return new ValidationError({
      message: `Expected finite number value, got ${value}`,
      value,
      ctx,
    });
  }

  /** @todo perform rule checks */

  return null;
}
