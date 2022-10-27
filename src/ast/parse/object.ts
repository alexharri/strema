import { ObjectNode } from "../../types/Ast";
import { parseProperties } from "./property";
import { ParserState } from "../state/ParserState";
import { enforceExhaustive } from "../../switch";

export function parseObject(state: ParserState): ObjectNode {
  if (!state.atDelimeter("{")) {
    throw new Error(`Expected '{'`);
  }

  state.nextToken();

  if (state.atDelimeter("}")) {
    // Immediately closed object
    state.nextToken();
    return { type: "object", properties: [], optional: true };
  }

  const properties = parseProperties(state);

  if (!state.atDelimeter("}")) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  state.nextToken();

  const anyRequiredProperty = properties.find((property) => {
    const type = property.value.type;
    switch (type) {
      case "array":
      case "record":
        return false;
      case "primitive":
      case "object":
        return !property.value.optional;
      default:
        enforceExhaustive(type);
    }
  });
  const optional = !anyRequiredProperty;

  return { type: "object", properties, optional };
}
