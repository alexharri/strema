import { enforceExhaustive } from "../switch";
import { PrimitiveNode } from "../types/Ast";
import { NumberRule, StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { validateBoolean } from "./boolean";
import { validateNumber } from "./number";
import { validateString } from "./string";
import { ValidationError } from "./ValidationError";

export function validatePrimitive(
  value: unknown,
  spec: PrimitiveNode,
  ctx: ValidationContext
): ValidationError | null {
  const isNullOrUndefined = typeof value === "undefined" || value === null;

  if (isNullOrUndefined) {
    value = spec.defaultValue;
  }

  const { valueType } = spec;
  switch (valueType) {
    case "string": {
      const rules = spec.rules as StringRule[];
      return validateString(value, rules, ctx);
    }
    case "number": {
      const rules = spec.rules as NumberRule[];
      return validateNumber(value, rules, ctx);
    }
    case "boolean": {
      return validateBoolean(value, ctx);
    }
    default:
      enforceExhaustive(valueType, "Unexpected value type");
  }
}
