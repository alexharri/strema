import { enforceExhaustive } from "../../switch";
import { Primitive } from "../../types/Primitive";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";

// So that the error message prints quotes around the value (like '"..."')
function quoteIfString(token: string, tokenType: TokenType) {
  if (tokenType === TokenType.String) {
    token = `"${token}"`;
  }
  return token;
}

function parseString(token: string, tokenType: TokenType) {
  if (tokenType !== TokenType.String) {
    throw new Error(`Expected string, got '${token}'`);
  }

  return token;
}

function parseNumber(token: string, tokenType: TokenType) {
  if (tokenType !== TokenType.Number) {
    throw new Error(
      `Expected number, got '${quoteIfString(token, tokenType)}'`
    );
  }

  const value = Number(token);

  if (!Number.isFinite(value)) {
    throw new Error(`Expected finite number, got '${value}'`);
  }

  return value;
}

function parseBoolean(token: string, tokenType: TokenType) {
  if (tokenType !== TokenType.Symbol) {
    throw new Error(
      `Expected boolean, got '${quoteIfString(token, tokenType)}'`
    );
  }

  switch (token) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`Unexpected token '${token}', expected true or false`);
  }
}

export function parseDefaultValue(
  state: ParserState,
  primitiveType: Primitive
): unknown {
  if (!state.atDelimeter("=")) {
    return null;
  }
  state.nextToken();

  const token = state.token();
  const tokenType = state.tokenType();

  state.nextToken();

  switch (primitiveType) {
    case "string":
      return parseString(token, tokenType);
    case "number":
      return parseNumber(token, tokenType);
    case "boolean":
      return parseBoolean(token, tokenType);
    default:
      enforceExhaustive(primitiveType, "Unexpected primitive type");
  }
}
