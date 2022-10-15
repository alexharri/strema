import { PropertyNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";
import { parseRules } from "./rules";
import { parseValue } from "./value";

function parseKey(state: ParserState): string {
  if (state.tokenType() === TokenType.None) {
    throw new Error(`Unexpected end of template`);
  }
  if (state.tokenType() !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }
  return state.token();
}

function parseIsArray(state: ParserState) {
  let isArray: boolean;

  if (state.atDelimeter("[")) {
    state.nextToken();
    if (!state.atDelimeter("]")) {
      throw new Error(`Expected ']'`);
    }
    state.nextToken();

    isArray = true;
  } else {
    isArray = false;
  }

  return isArray;
}

export function parseProperty(state: ParserState): PropertyNode {
  const key = parseKey(state);

  state.nextToken();

  if (!state.atDelimeter(":")) {
    throw new Error(`Expected ':'`);
  }

  state.nextToken();

  const value = parseValue(state);
  const isArray = parseIsArray(state);

  if (value.type === "primitive") {
    value.rules = parseRules(state, value.valueType);
  }

  const property: PropertyNode = { type: "property", key, value };

  if (isArray) {
    property.value = { type: "array", value: property.value };
  }

  return property;
}

export function parseProperties(state: ParserState): PropertyNode[] {
  let expectMoreProperties = true;
  const properties: PropertyNode[] = [];

  while (expectMoreProperties) {
    const property = parseProperty(state);
    properties.push(property);

    const atPropertySeparator = state.atDelimeter(";");
    if (atPropertySeparator) {
      // We can just jump over property separators
      state.nextToken();
    }

    const atObjectClose = state.atDelimeter("}");
    if (atObjectClose) {
      expectMoreProperties = false;
    }
  }

  return properties;
}
