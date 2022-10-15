import { enforceExhaustive } from "../../switch";
import { StringRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { emailRegex } from "../utils/regex";
import { ValidationError } from "../ValidationError";

function validateEmail(
  ctx: ValidationContext,
  value: string
): ValidationError | null {
  if (emailRegex.test(value)) {
    return null;
  }
  return new ValidationError({ message: "Invalid email address", ctx, value });
}

export function validateStringRule(
  ctx: ValidationContext,
  value: string,
  rule: StringRule
): ValidationError | null {
  const { type } = rule;
  switch (type) {
    case "email":
      return validateEmail(ctx, value);
    default:
      enforceExhaustive(type);
  }
}
