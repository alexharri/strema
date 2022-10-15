import { Primitive } from "../../types/Primitive";
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
  state.nextToken();

  if (!Number.isFinite(value)) {
    throw new Error(`Expected finite number, got '${value}'`);
  }

  if (!state.atDelimeter(")")) {
    throw new Error(`Unexpected token '${state.token()}', expected ')'`);
  }
  state.nextToken();

  return value;
}

export function parseRule(state: ParserState, primitiveType: Primitive): Rule {
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
    throw new Error(`Expected rule name, got '${state.token()}'`);
  }

  const ruleName = state.token();
  state.nextToken();

  const arg = parseRuleArgument(state);

  const rule = resolveRule(primitiveType, ruleName, arg);

  return rule;
}

export function parseRules(
  state: ParserState,
  primitiveType: Primitive
): Rule[] {
  const rules: Rule[] = [];

  if (!state.atDelimeter("<")) {
    return rules;
  }
  state.nextToken();

  while (!state.atDelimeter(">")) {
    const rule = parseRule(state, primitiveType);

    if (state.atDelimeter(",")) {
      state.nextToken();
    } else if (!state.atDelimeter(">")) {
      throw new Error(`Expected ',' or '>', got '${state.token()}'`);
    }

    rules.push(rule);
  }
  state.nextToken();

  return rules;
}
