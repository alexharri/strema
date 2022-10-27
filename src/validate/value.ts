import { enforceExhaustive } from "../switch";
import { ValueNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { validateArray } from "./array";
import { validateObject } from "./object";
import { validatePrimitive } from "./primitive";
import { validateRecord } from "./record";

export function validateValue(
  value: unknown,
  valueSpec: ValueNode,
  ctx: ValidationContext
) {
  const { type } = valueSpec;
  switch (type) {
    case "object": {
      const err = validateObject(value, valueSpec, ctx);
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
    case "record": {
      const err = validateRecord(value, valueSpec, ctx);
      if (err) return err;
      break;
    }
    default:
      enforceExhaustive(type, "Unexpected value type");
  }
}
