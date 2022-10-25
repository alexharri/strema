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
    toRule: (arg) => ({ type: "max", value: arg! }),
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

const ruleTestsByName = ruleTests.reduce((obj, ruleTest) => {
  obj[ruleTest.rule] = ruleTest;
  return obj;
}, {} as Partial<Record<string, RuleTest>>);

const rulesWithMultiplePrimitiveTypes = (() => {
  const ruleNameCount: Record<string, number> = {};

  for (const { rule } of ruleTests) {
    if (!ruleNameCount[rule]) {
      ruleNameCount[rule] = 0;
    }
    ruleNameCount[rule]++;
  }

  const set = new Set<string>();

  for (const [rule, value] of Object.entries(ruleNameCount)) {
    if (value > 1) {
      set.add(rule);
    }
  }

  return set;
})();

export function resolveRule(
  primitiveType: Primitive,
  rule: string,
  arg: number | null
) {
  const hasArg = arg !== null;

  const ruleTest = ruleTestsByName[rule];

  if (!ruleTest) {
    throw new Error(`Unknown rule '${rule}'`);
  }

  const isWrongPrimitiveType = ruleTest.primitiveType !== primitiveType;
  if (isWrongPrimitiveType && !rulesWithMultiplePrimitiveTypes.has(rule)) {
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
