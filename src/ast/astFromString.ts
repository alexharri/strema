import { Ast } from "../types/Ast";
import { parseObject } from "./parse/object";
import { ParserState } from "./state/ParserState";
import { TokenType } from "./token";

export function astFromString(s: string): Ast {
  const state = new ParserState(s);
  const out = parseObject(state);

  if (state.tokenType() !== TokenType.None) {
    throw new Error("Expected end of template");
  }

  return out;
}
