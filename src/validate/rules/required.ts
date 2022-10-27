import { ValidationContext } from "../../types/ValidationContext";
import { isNullOrUndefined } from "../utils/isNullOrUndefined";
import { stringifyPropertyPath } from "../utils/stringifyPropertyPath";
import { ValidationError } from "../ValidationError";

export function validateRequired(
  ctx: ValidationContext,
  value: unknown
): ValidationError | null {
  if (isNullOrUndefined(value)) {
    throw new ValidationError({
      message: `Field '${stringifyPropertyPath(ctx.path)}' is required`,
      ctx,
      value,
    });
  }
  return null;
}
