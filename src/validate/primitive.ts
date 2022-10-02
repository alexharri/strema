import { enforceExhaustive } from "../switch";
import { PrimitiveNode } from "../types/Ast";
import { NumberRule, StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { validateNumber } from "./number";
import { validateString } from "./string";
import { ValidationError } from "./ValidationError";

export function validatePrimitive(
  value: unknown,
  spec: PrimitiveNode,
  ctx: ValidationContext
): ValidationError | null {
  const { valueType } = spec;
  switch (valueType) {
    case "string": {
      /** @todo read rules from spec */
      const rules: StringRule[] = [];
      return validateString(value, rules, ctx);
    }
    case "number": {
      /** @todo read rules from spec */
      const rules: NumberRule[] = [];
      return validateNumber(value, rules, ctx);
    }
    default:
      enforceExhaustive(valueType, "Unexpected value type");
  }
}
