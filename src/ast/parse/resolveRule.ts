import { PrimitiveType } from "../../types/Ast";
import { Rule, RuleType } from "../../types/Rule";

interface RuleTest {
  rule: RuleType;
  primitiveType: PrimitiveType;
  requiresNumericArgument: boolean;
  toRule: (arg: number | null) => Rule;
}

const ruleTests: RuleTest[] = [
  {
    rule: "email",
    primitiveType: "string",
    requiresNumericArgument: false,
    toRule: () => ({ type: "email" }),
  },
  {
    rule: "positive",
    primitiveType: "number",
    requiresNumericArgument: false,
    toRule: () => ({ type: "positive" }),
  },
  {
    rule: "int",
    primitiveType: "number",
    requiresNumericArgument: false,
    toRule: () => ({ type: "int" }),
  },
  {
    rule: "min",
    primitiveType: "number",
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "min", value: arg! }),
  },
  {
    rule: "max",
    primitiveType: "number",
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "max", value: arg! }),
  },
];

const ruleTestsByName = ruleTests.reduce((obj, ruleTest) => {
  obj[ruleTest.rule] = ruleTest;
  return obj;
}, {} as Partial<Record<string, RuleTest>>);

export function resolveRule(
  primitiveType: PrimitiveType,
  rule: string,
  arg: number | null
) {
  const hasArg = arg !== null;

  const ruleTest = ruleTestsByName[rule];

  if (!ruleTest) {
    throw new Error(`Unknown rule '${rule}'`);
  }

  if (ruleTest.primitiveType !== primitiveType) {
    throw new Error(
      `Rule '${rule}' expects a ${ruleTest.primitiveType}, ` +
        `you provided a ${primitiveType} value`
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
