import { typeAsString } from "../format/typeAsString";
import { ValidationContext } from "../types/ValidationContext";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { ValidationError } from "./ValidationError";

export function validateBoolean(
  value: unknown,
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(value)) {
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
