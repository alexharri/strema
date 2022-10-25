import { typeAsString } from "../format/typeAsString";
import { RecordNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { isNullOrUndefined } from "./utils/isNullOrUndefined";
import { isPlainObject } from "./utils/isPlainObject";
import { ValidationError } from "./ValidationError";
import { validateValue } from "./value";

export function validateRecord(
  record: unknown,
  spec: RecordNode,
  ctx: ValidationContext
): ValidationError | null {
  if (isNullOrUndefined(record)) {
    return null;
  }

  const isNotObjectValue = !isPlainObject(record);
  if (isNotObjectValue) {
    return new ValidationError({
      message: `Expected object value, got ${typeAsString(record)}`,
      value: record,
      ctx,
    });
  }

  const entries = Object.entries(record as {});

  for (const [key, value] of entries) {
    ctx.path.push(key);

    if (spec.key.valueType === "number") {
      const keyAsNumber = Number(key);
      if (!Number.isFinite(keyAsNumber)) {
        return new ValidationError({
          message: `Expected numeric key, got '${key}'`,
          value: key,
          ctx,
        });
      }
    }

    const valueErr = validateValue(value, spec.value, ctx);
    if (valueErr) return valueErr;

    ctx.path.pop();
  }

  return null;
}
