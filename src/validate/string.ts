import { typeAsString } from "../format/typeAsString";
import { StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";

export function validateString(
  value: unknown,
  rules: StringRule[],
  ctx: ValidationContext
): ValidationError | null {
  const isNullOrUndefined = value === undefined || value === null;
  if (isNullOrUndefined) {
    return null;
  }

  const isNotStringValue = typeof value !== "string";
  if (isNotStringValue) {
    return new ValidationError({
      message: `Expected string value, got ${typeAsString(value)}`,
      value,
      ctx,
    });
  }

  /** @todo perform rule checks */

  return null;
}
