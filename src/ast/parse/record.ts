import { PrimitiveNode, RecordNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseArrayableValueAndRules } from "./property";
import { parseValue } from "./value";

function parseKey(state: ParserState): PrimitiveNode {
  const value = parseValue(state);

  if (value.type !== "primitive") {
    throw new Error(
      `Record keys must be either string or number, got '${value.type}'`
    );
  }

  switch (value.valueType) {
    case "string":
    case "number":
      break;
    default:
      throw new Error(
        `Record keys must be either string or number, got '${value.valueType}'`
      );
  }

  return value;
}

export function parseRecord(state: ParserState): RecordNode {
  if (state.token() !== "Record") {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  state.nextToken();

  if (!state.atDelimeter("<")) {
    throw new Error(`Expected '<', got '${state.token()}'`);
  }

  state.nextToken();

  const key = parseKey(state);

  if (!state.atDelimeter(",")) {
    throw new Error(`Expected ',', got '${state.token()}'`);
  }

  state.nextToken();

  const value = parseArrayableValueAndRules(state);

  if (!state.atDelimeter(">")) {
    throw new Error(`Expected '>', got '${state.token()}'`);
  }

  state.nextToken();

  return { type: "record", key, value };
}
