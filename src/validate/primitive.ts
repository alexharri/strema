import { enforceExhaustive } from "../switch";
import { PrimitiveNode } from "../types/Ast";
import { NumberRule, StringRule } from "../types/Rule";
import { validateNumber } from "./number";
import { validateString } from "./string";

/**
 * @returns empty string if valid
 */
export function validatePrimitive(value: unknown, spec: PrimitiveNode): string {
  const { valueType } = spec;
  switch (valueType) {
    case "string": {
      /** @todo read rules from spec */
      const rules: StringRule[] = [];
      return validateString(value, rules);
    }
    case "number": {
      /** @todo read rules from spec */
      const rules: NumberRule[] = [];
      return validateNumber(value, rules);
    }
    default:
      enforceExhaustive(valueType, "Unexpected value type");
  }
}
