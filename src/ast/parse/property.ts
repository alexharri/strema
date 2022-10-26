import { PropertyNode, ValueNode } from "../../types/Ast";
import { callNTimes } from "../../validate/utils/callNTimes";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";
import { parseDefaultValue } from "./defaultValue";
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

/**
 * Parses array notation to determine the dimension of the array.
 *
 *  - `[]` resolves to 1
 *  - `[][]` resolves to 2
 *
 * If there is no array notation, 0 is returned
 */
function parseArrayDimension(state: ParserState) {
  let dimension = 0;

  while (state.atDelimeter("[")) {
    state.nextToken();
    if (!state.atDelimeter("]")) {
      throw new Error(`Expected ']'`);
    }
    state.nextToken();

    dimension++;
  }

  return dimension;
}

export function parseArrayableValueAndRules(state: ParserState): ValueNode {
  let value = parseValue(state);
  const arrayDimension = parseArrayDimension(state);

  if (value.type === "primitive") {
    value.rules = parseRules(state, value.valueType);
    value.defaultValue = parseDefaultValue(state, value.valueType);
  }

  callNTimes(arrayDimension, () => {
    value = { type: "array", value };
  });

  return value;
}

export function parseProperty(state: ParserState): PropertyNode {
  const key = parseKey(state);

  state.nextToken();

  if (!state.atDelimeter(":")) {
    throw new Error(`Expected ':'`);
  }

  state.nextToken();

  const value = parseArrayableValueAndRules(state);

  const property: PropertyNode = { type: "property", key, value };

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
