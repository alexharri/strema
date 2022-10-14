export type StringRule = { type: "email" };

export type NumberRule =
  | { type: "int" }
  | { type: "positive" }
  | { type: "min"; value: number }
  | { type: "max"; value: number };

export type Rule = StringRule | NumberRule;
