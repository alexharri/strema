import { enforceExhaustive } from "../../switch";
import { BooleanRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { ValidationError } from "../ValidationError";
import { validateRequired } from "./required";

export function validateBooleanRule(
  ctx: ValidationContext,
  value: boolean,
  rule: BooleanRule
): ValidationError | null {
  const { type } = rule;
  switch (type) {
    case "required":
      return validateRequired(ctx, value);
    default:
      enforceExhaustive(type);
  }
}
