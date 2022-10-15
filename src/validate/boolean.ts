import { typeAsString } from "../format/typeAsString";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";

export function validateBoolean(
  value: unknown,
  ctx: ValidationContext
): ValidationError | null {
  const isNullOrUndefined = value === undefined || value === null;
  if (isNullOrUndefined) {
    return null;
  }

  const isNotBooleanValue = typeof value !== "boolean";
  if (isNotBooleanValue) {
    return new ValidationError({
      message: `Expected boolean value, got ${typeAsString(value)}`,
      value,
      ctx,
    });
  }

  return null;
}
