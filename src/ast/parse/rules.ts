import { PrimitiveNode } from "../../types/Ast";
import { Rule } from "../../types/Rule";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";
import { resolveRule } from "./resolveRule";

function parseRuleArgument(state: ParserState): number | null {
  if (!state.atDelimeter("(")) {
    return null;
  }
  state.nextToken();

  if (state.tokenType() !== TokenType.Number) {
    throw new Error(`Expected numeric argument, got '${state.token()}'`);
  }

  const value = Number(state.token());

  if (!Number.isFinite(value)) {
    throw new Error(`Expected finite number, got '${value}'`);
  }

  if (!state.atDelimeter(")")) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  return value;
}

function parseRule(state: ParserState, primitiveNode: PrimitiveNode): Rule {
  // Rules are comprised of a symbol, optionally followed by a single
  // argument within parenthesis (like a function call):
  //
  //    - int
  //    - min(1)
  //
  // The rules are contained within '<>' and separated by a comma ','.
  //
  //    - <int>
  //    - <min(1)>
  //    - <int, min(0), max(10)>
  //
  // After parsing a rule, skip over the comma ',' if present.

  if (state.tokenType() !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  const ruleName = state.token();
  const arg = parseRuleArgument(state);

  const rule = resolveRule(primitiveNode, ruleName, arg);

  if (state.atDelimeter(",")) {
    state.nextToken();
  }

  return rule;
}

export function parseRules(
  state: ParserState,
  primitiveNode: PrimitiveNode
): Rule[] {
  const rules: Rule[] = [];

  if (!state.atDelimeter("<")) {
    return rules;
  }
  state.nextToken();

  while (!state.atDelimeter(">")) {
    const rule = parseRule(state, primitiveNode);
    rules.push(rule);
  }
  state.nextToken();

  return rules;
}
