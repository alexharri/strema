import { typeAsString } from "../format/typeAsString";
import { RecordNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { validatePrimitive } from "./primitive";
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

  for (const [_key, value] of entries) {
    ctx.path.push(_key);

    let key = _key as string | number;
    if (spec.key.valueType === "number") {
      key = Number(key);
    }

    const keyErr = validatePrimitive(key, spec.key, ctx);
    if (keyErr) return keyErr;

    const valueErr = validateValue(value, spec.value, ctx);
    if (valueErr) return valueErr;

    ctx.path.pop();
  }

  return null;
}
