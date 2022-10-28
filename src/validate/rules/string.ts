import { enforceExhaustive } from "../../switch";
import { StringRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { emailRegex, uuidRegex } from "../utils/regex";
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

function validateMin(
  ctx: ValidationContext,
  value: string,
  min: number
): ValidationError | null {
  if (value.length < min) {
    return new ValidationError({
      message: `String length must be lower than ${min}`,
      ctx,
      value,
    });
  }
  return null;
}

function validateMax(
  ctx: ValidationContext,
  value: string,
  max: number
): ValidationError | null {
  if (value.length > max) {
    return new ValidationError({
      message: `String length must not exceed ${max}`,
      ctx,
      value,
    });
  }
  return null;
}

function validateLength(
  ctx: ValidationContext,
  value: string,
  len: number
): ValidationError | null {
  if (value.length !== len) {
    return new ValidationError({
      message: `String length must equal ${len}`,
      ctx,
      value,
    });
  }
  return null;
}

function validateUuid(
  ctx: ValidationContext,
  value: string
): ValidationError | null {
  if (!uuidRegex.test(value)) {
    return new ValidationError({
      message: "String is not a valid uuid",
      ctx,
      value,
    });
  }
  return null;
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
    case "min":
      return validateMin(ctx, value, rule.value);
    case "max":
      return validateMax(ctx, value, rule.value);
    case "length":
      return validateLength(ctx, value, rule.value);
    case "uuid":
      return validateUuid(ctx, value);
    default:
      enforceExhaustive(type);
  }
}
