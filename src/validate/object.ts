import { typeAsString } from "../format/typeAsString";
import { PropertyNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { isPlainObject } from "./utils/isPlainObject";
import { ValidationError } from "./ValidationError";
import { validateValue } from "./value";

export function validateObject(
  obj: unknown,
  properties: PropertyNode[],
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(obj)) {
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

  for (const property of properties) {
    ctx.path.push(property.key);

    const value = (obj as Record<string, unknown>)[property.key];

    const err = validateValue(value, property.value, ctx);
    if (err) return err;

    ctx.path.pop();
  }

  return null;
}
