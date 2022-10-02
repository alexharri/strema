import { typeAsString } from "../format/typeAsString";
import { enforceExhaustive } from "../switch";
import { ArrayNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { validateObject } from "./object";
import { validatePrimitive } from "./primitive";
import { ValidationError } from "./ValidationError";

/**
 * @returns empty string if valid
 */
export function validateArray(
  arr: unknown[],
  spec: ArrayNode,
  ctx: ValidationContext
): ValidationError | null {
  const isNullOrUndefined = arr === undefined || arr === null;

  if (isNullOrUndefined) {
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
    const { type } = spec.value;
    switch (type) {
      case "object": {
        const err = validateObject(value, spec.value.properties, ctx);
        if (err) return err;
        break;
      }
      case "array": {
        const err = validateArray(value, spec.value, ctx);
        if (err) return err;
        break;
      }
      case "primitive": {
        const err = validatePrimitive(value, spec.value, ctx);
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
