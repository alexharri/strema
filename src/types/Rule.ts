export type StringEmailRule = { type: "email" };

export type StringRule = StringEmailRule;

export type NumberIntRule = { type: "int" };
export type NumberPositiveRule = { type: "positive" };
export type NumberMaxRule = { type: "max"; value: number };
export type NumberMinRule = { type: "min"; value: number };

export type NumberRule =
  | NumberIntRule
  | NumberPositiveRule
  | NumberMinRule
  | NumberMaxRule;

export type Rule = StringRule | NumberRule;

export type RuleType = Rule["type"];
