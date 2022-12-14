import { typeAsString } from "../format/typeAsString";
import { StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { validateStringRule } from "./rules/string";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { ValidationError } from "./ValidationError";

export function validateString(
  value: unknown,
  rules: StringRule[],
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(value)) {
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

  for (const rule of rules) {
    const err = validateStringRule(ctx, value, rule);
    if (err) {
      return err;
    }
  }

  return null;
}
