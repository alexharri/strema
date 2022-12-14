import { enforceExhaustive } from "../../switch";
import { PropertyNode, ValueNode } from "../../types/Ast";
import { callNTimes } from "../../validate/utils/callNTimes";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";
import { parseDefaultValue } from "./defaultValue";
import { parseRules } from "./rules";
import { parseValue } from "./value";

function parseKey(state: ParserState): [key: string, optional: boolean] {
  if (state.tokenType() === TokenType.None) {
    throw new Error(`Unexpected end of template`);
  }
  if (state.tokenType() !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }
  const key = state.token();

  state.nextToken();

  let optional = false;

  if (state.atDelimeter("?")) {
    optional = true;
    state.nextToken();
  }

  if (!state.atDelimeter(":")) {
    throw new Error(`Expected ':'`);
  }

  state.nextToken();

  return [key, optional];
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

export function parseArrayableValueAndRules(
  state: ParserState,
  { optional }: { optional: boolean }
): ValueNode {
  let value = parseValue(state);
  const arrayDimension = parseArrayDimension(state);

  if (value.type === "primitive") {
    value.rules = parseRules(state, value.valueType);
    value.defaultValue = parseDefaultValue(state, value.valueType);
  }

  callNTimes(arrayDimension, () => {
    value = { type: "array", value, optional: false };
  });

  if (optional) {
    const { type } = value;
    switch (type) {
      case "object":
      case "array":
      case "primitive":
        value.optional = true;
        break;
      case "record":
        throw new Error(`Type '${type}' cannot be optional`);
      default:
        enforceExhaustive(type);
    }
  }

  const requiredPrimitiveHasDefaultValue =
    value.type === "primitive" &&
    !value.optional &&
    value.defaultValue !== null;

  if (requiredPrimitiveHasDefaultValue) {
    throw new Error(`Non-optional fields cannot have default values.`);
  }

  return value;
}

export function parseProperty(state: ParserState): PropertyNode {
  const [key, optional] = parseKey(state);

  const value = parseArrayableValueAndRules(state, { optional });

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
