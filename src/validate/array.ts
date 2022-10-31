import { typeAsString } from "../format/typeAsString";
import { ArrayNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { stringifyPropertyPath } from "./utils/stringifyPropertyPath";
import { ValidationError } from "./ValidationError";
import { validateValue } from "./value";

export function validateArray(
  arr: unknown[],
  spec: ArrayNode,
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(arr)) {
    if (!spec.optional) {
      return new ValidationError({
        message: `Field '${stringifyPropertyPath(ctx.path)}' is required`,
        value: arr,
        ctx,
      });
    }
    return null;
  }

  const isNotArray = !Array.isArray(arr);

  if (isNotArray) {
    return new ValidationError({
      message: `Expected array, got ${typeAsString(arr)}`,
      value: arr,
      ctx,
    });
  }

  for (let i = 0; i < arr.length; i++) {
    ctx.path.push(`[${i}]`);

    const value = arr[i];

    const err = validateValue(value, spec.value, ctx);
    if (err) return err;

    ctx.path.pop();
  }

  return null;
}
