import { typeAsString } from "../format/typeAsString";
import { enforceExhaustive } from "../switch";
import { PropertyNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { validateArray } from "./array";
import { validatePrimitive } from "./primitive";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { isPlainObject } from "./utils/isPlainObject";
import { ValidationError } from "./ValidationError";

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

  for (const { key, value: valueSpec } of properties) {
    ctx.path.push(key);

    const { type } = valueSpec;
    const value = (obj as Record<string, unknown>)[key];
    switch (type) {
      case "object": {
        const err = validateObject(value, valueSpec.properties, ctx);
        if (err) return err;
        break;
      }
      case "array": {
        const err = validateArray(value as unknown[], valueSpec, ctx);
        if (err) return err;
        break;
      }
      case "primitive": {
        const err = validatePrimitive(value, valueSpec, ctx);
        if (err) return err;
        break;
      }
      default:
        enforceExhaustive(type, "Unexpected value type");
    }

    ctx.path.pop();
  }

  return null;
}
