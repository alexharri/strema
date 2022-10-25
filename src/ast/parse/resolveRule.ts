import { Primitive } from "../../types/Primitive";
import { Rule, RuleType } from "../../types/Rule";

interface RuleTest {
  rule: RuleType;
  primitiveType: Primitive;
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
    rule: "min",
    primitiveType: "string",
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "min", value: arg! }),
  },
  {
    rule: "max",
    primitiveType: "string",
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "max", value: arg! }),
  },
  {
    rule: "length",
    primitiveType: "string",
    requiresNumericArgument: true,
    toRule: (arg) => ({ type: "length", value: arg! }),
  },
  {
    rule: "uuid",
    primitiveType: "string",
    requiresNumericArgument: false,
    toRule: () => ({ type: "uuid" }),
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

const ruleTestsByTypeAndName = ruleTests.reduce((obj, ruleTest) => {
  if (!obj[ruleTest.primitiveType]) {
    obj[ruleTest.primitiveType] = {};
  }
  obj[ruleTest.primitiveType]![ruleTest.rule] = ruleTest;
  return obj;
}, {} as Partial<Record<Primitive, Partial<Record<string, RuleTest>>>>);

export function resolveRule(
  primitiveType: Primitive,
  rule: string,
  arg: number | null
) {
  const hasArg = arg !== null;

  const ruleTest = ruleTestsByTypeAndName[primitiveType]?.[rule];

  if (!ruleTest) {
    throw new Error(`Unknown ${primitiveType} rule '${rule}'`);
  }

  if (ruleTest.requiresNumericArgument && !hasArg) {
    throw new Error(`Rule '${rule}' expects a single numeric argument.`);
  }

  if (!ruleTest.requiresNumericArgument && hasArg) {
    throw new Error(`Rule '${rule}' expects no arguments.`);
  }

  return ruleTest.toRule(arg);
}
