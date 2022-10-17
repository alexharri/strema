import { typeAsString } from "../format/typeAsString";
import { NumberRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { validateNumberRule } from "./rules/number";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { ValidationError } from "./ValidationError";

export function validateNumber(
  value: unknown,
  rules: NumberRule[],
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(value)) {
    return null;
  }

  const isNotNumberValue = typeof value !== "number";
  if (isNotNumberValue) {
    return new ValidationError({
      message: `Expected number value, got ${typeAsString(value)}`,
      value,
      ctx,
    });
  }

  if (!Number.isFinite(value)) {
    return new ValidationError({
      message: `Expected finite number value, got ${value}`,
      value,
      ctx,
    });
  }

  for (const rule of rules) {
    const err = validateNumberRule(ctx, value, rule);
    if (err) {
      return err;
    }
  }

  return null;
}
