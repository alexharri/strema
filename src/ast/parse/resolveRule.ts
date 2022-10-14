import { PrimitiveNode } from "../../types/Ast";
import { Rule } from "../../types/rule";

enum PrimitiveType {
  String = "string",
  Number = "number",
}

interface RuleTest {
  rule: Rule["type"];
  valueType: PrimitiveType;
  requiresNumericArgument: boolean;
  toRule: (arg: number | null) => Rule;
}

const ruleTests: RuleTest[] = [
  {
    rule: "email",
    valueType: PrimitiveType.String,
    requiresNumericArgument: false,
    toRule: () => ({ type: "email" }),
  },
  {
    rule: "positive",
    valueType: PrimitiveType.Number,
    requiresNumericArgument: false,
    toRule: () => ({ type: "positive" }),
  },
  {
    rule: "integer",
    valueType: PrimitiveType.Number,
    requiresNumericArgument: false,
    toRule: () => ({ type: "integer" }),
  },
  {
    rule: "min",
    valueType: PrimitiveType.Number,
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "min", value: arg! }),
  },
  {
    rule: "max",
    valueType: PrimitiveType.Number,
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "max", value: arg! }),
  },
];

const ruleTestsByName = ruleTests.reduce((obj, ruleTest) => {
  obj[ruleTest.rule] = ruleTest;
  return obj;
}, {} as Partial<Record<string, RuleTest>>);

export function resolveRule(
  primitiveNode: PrimitiveNode,
  rule: string,
  arg: number | null
) {
  const { valueType } = primitiveNode;
  const hasArg = arg !== null;

  const ruleTest = ruleTestsByName[rule];

  if (!ruleTest) {
    throw new Error(`Unknown rule '${rule}'`);
  }

  if (ruleTest.valueType !== valueType) {
    throw new Error(
      `Rule '${rule}' expects a ${ruleTest.valueType}, ` +
        `you provided a ${valueType} value`
    );
  }

  if (ruleTest.requiresNumericArgument && !hasArg) {
    throw new Error(`Rule '${rule}' expects a single numeric argument.`);
  }

  if (!ruleTest.requiresNumericArgument && hasArg) {
    throw new Error(`Rule '${rule}' expects no arguments.`);
  }

  return ruleTest.toRule(arg);
}
