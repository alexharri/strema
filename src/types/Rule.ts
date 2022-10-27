export type StringEmailRule = { type: "email" };
export type StringMinRule = { type: "min"; value: number };
export type StringMaxRule = { type: "max"; value: number };
export type StringLengthRule = { type: "length"; value: number };
export type StringUuidRule = { type: "uuid" };

export type StringRule =
  | StringEmailRule
  | StringMinRule
  | StringMaxRule
  | StringLengthRule
  | StringUuidRule;

export type NumberIntRule = { type: "int" };
export type NumberPositiveRule = { type: "positive" };
export type NumberMaxRule = { type: "max"; value: number };
export type NumberMinRule = { type: "min"; value: number };

export type NumberRule =
  | NumberIntRule
  | NumberPositiveRule
  | NumberMinRule
  | NumberMaxRule;

export type Rule = StringRule | NumberRule | BooleanRule;

export type RuleType = Rule["type"];
