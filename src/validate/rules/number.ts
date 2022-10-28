import { enforceExhaustive } from "../../switch";
import { NumberMaxRule, NumberMinRule, NumberRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { ValidationError } from "../ValidationError";

function validateInt(
  ctx: ValidationContext,
  value: number
): ValidationError | null {
  if (Number.isInteger(value)) {
    return null;
  }
  return new ValidationError({
    message: "Number is not an integer",
    ctx,
    value,
  });
}

function validatePositive(
  ctx: ValidationContext,
  value: number
): ValidationError | null {
  if (value >= 0) {
    return null;
  }
  return new ValidationError({ message: "Number is not positive", ctx, value });
}

function validateMin(
  ctx: ValidationContext,
  value: number,
  rule: NumberMinRule
): ValidationError | null {
  if (value >= rule.value) {
    return null;
  }
  return new ValidationError({
    message: `Number is lower than '${rule.value}'`,
    ctx,
    value,
  });
}

function validateMax(
  ctx: ValidationContext,
  value: number,
  rule: NumberMaxRule
): ValidationError | null {
  if (value <= rule.value) {
    return null;
  }
  return new ValidationError({
    message: `Number is higher than '${rule.value}'`,
    ctx,
    value,
  });
}

export function validateNumberRule(
  ctx: ValidationContext,
  value: number,
  rule: NumberRule
): ValidationError | null {
  const { type } = rule;
  switch (type) {
    case "int":
      return validateInt(ctx, value);
    case "positive":
      return validatePositive(ctx, value);
    case "min":
      return validateMin(ctx, value, rule);
    case "max":
      return validateMax(ctx, value, rule);
    default:
      enforceExhaustive(type);
  }
}
