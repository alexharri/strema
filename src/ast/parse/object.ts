import { ObjectNode } from "../../types/Ast";
import { parseProperties } from "./property";
import { State } from "../State";
import { TokenType } from "../token";

export function parseObject(state: State): ObjectNode {
  if (state.tokenType() !== TokenType.Delimeter || state.token() !== "{") {
    throw new Error(`Expected '{'`);
  }

  state.nextToken();

  if (state.tokenType() === TokenType.Delimeter && state.token() === "}") {
    // Immediately closed object
    return { type: "object", properties: [] };
  }

  const properties = parseProperties(state);
  return { type: "object", properties };
}
