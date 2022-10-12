import { ObjectNode } from "../../types/Ast";
import { parseProperties } from "./property";
import { ParserState } from "../state/ParserState";

export function parseObject(state: ParserState): ObjectNode {
  if (!state.atDelimeter("{")) {
    throw new Error(`Expected '{'`);
  }

  state.nextToken();

  if (state.atDelimeter("}")) {
    // Immediately closed object
    state.nextToken();
    return { type: "object", properties: [] };
  }

  const properties = parseProperties(state);

  if (!state.atDelimeter("}")) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  state.nextToken();

  return { type: "object", properties };
}
