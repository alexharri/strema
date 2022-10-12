import { PropertyNode } from "../../types/Ast";
import { State } from "../State";
import { TokenType } from "../token";
import { parsePropertyValue } from "./value";

function parseKey(state: State): string {
  if (state.tokenType() === TokenType.None) {
    throw new Error(`Unexpected end of template`);
  }
  if (state.tokenType() !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }
  return state.token();
}

function parseProperty(state: State): PropertyNode {
  const key = parseKey(state);

  state.nextToken();

  if (!state.atDelimeter(":")) {
    throw new Error(`Expected ':'`);
  }

  state.nextToken();

  const value = parsePropertyValue(state);

  let property: PropertyNode;

  if (state.atDelimeter("[")) {
    state.nextToken();
    if (!state.atDelimeter("]")) {
      throw new Error(`Expected ']'`);
    }
    property = {
      type: "property",
      key,
      value: { type: "array", value },
    };
    state.nextToken();
  } else {
    property = { type: "property", key, value };
  }

  /** @todo check for rules */

  return property;
}

export function parseProperties(state: State): PropertyNode[] {
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
