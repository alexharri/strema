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
    return {
      type: "object",
      properties: [],
      optional: false,
      hasRequiredProperties: false,
    };
  }

  const properties = parseProperties(state);

  if (!state.atDelimeter("}")) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }

  state.nextToken();

  const hasRequiredProperties = !!properties.find((property) => {
    const type = property.value.type;
    switch (type) {
      case "record":
        return false;
      case "object": {
        const { optional, hasRequiredProperties } = property.value;
        return !optional && hasRequiredProperties;
      }
      case "array":
      case "primitive":
        return !property.value.optional;
      default:
        enforceExhaustive(type);
    }
  });

  return {
    type: "object",
    properties,
    optional: false, // Optionality is set later in 'parseProperty'
    hasRequiredProperties,
  };
}
