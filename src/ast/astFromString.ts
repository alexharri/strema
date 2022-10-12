import { Ast } from "../types/Ast";
import { parseObject } from "./parse/object";
import { State } from "./State";
import { TokenType } from "./token";

export function astFromString(s: string): Ast {
  const state = new State(s);
  const out = parseObject(state);

  state.nextToken();
  if (state.tokenType() !== TokenType.None) {
    throw new Error("Expected end of template");
  }

  return out;
}
