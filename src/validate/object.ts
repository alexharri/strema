import { typeAsString } from "../format/typeAsString";
import { ObjectNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { isPlainObject } from "./utils/isPlainObject";
import { stringifyPropertyPath } from "./utils/stringifyPropertyPath";
import { ValidationError } from "./ValidationError";
import { validateValue } from "./value";

export function validateObject(
  obj: unknown,
  spec: ObjectNode,
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(obj)) {
    if (!spec.optional && spec.hasRequiredProperties) {
      return new ValidationError({
        message: `Field '${stringifyPropertyPath(ctx.path)}' is required`,
        value: obj,
        ctx,
      });
    }
    return null;
  }

  const isNotObjectValue = !isPlainObject(obj);
  if (isNotObjectValue) {
    return new ValidationError({
      message: `Expected object value, got ${typeAsString(obj)}`,
      value: obj,
      ctx,
    });
  }

  for (const property of spec.properties) {
    ctx.path.push(property.key);

    const value = (obj as Record<string, unknown>)[property.key];

    const err = validateValue(value, property.value, ctx);
    if (err) return err;

    ctx.path.pop();
  }

  return null;
}
