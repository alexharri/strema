import { enforceExhaustive } from "../../switch";
import { ValueNode } from "../../types/Ast";
import { parseObject } from "./object";
import { ParserState } from "../state/ParserState";
import { TokenType } from "../token";
import { PrimitivesTuple } from "../../types/Primitive";

const primitiveList: PrimitivesTuple = ["string", "number", "boolean"];
const primitives = new Set(primitiveList);

type PrimitiveSymbol = typeof primitiveList[number];

function isPrimitiveSymbol(s: string): s is PrimitiveSymbol {
  return primitives.has(s as PrimitiveSymbol);
}

export function parseValue(state: ParserState): ValueNode {
  let value: ValueNode;

  const tokenType = state.tokenType();
  switch (tokenType) {
    case TokenType.Symbol: {
      const token = state.token();
      if (!isPrimitiveSymbol(token)) {
        throw new Error(`Unknown symbol '${token}'`);
      }
      value = {
        type: "primitive",
        valueType: token,
        rules: [], // The rules are added later in 'parseProperty'
      };
      state.nextToken();
      break;
    }
    case TokenType.Delimeter: {
      if (state.token() !== "{") {
        throw new Error(`Unexpected token '${state.token()}'`);
      }
      value = parseObject(state);
      break;
    }
    case TokenType.None:
      throw new Error(`Expected end of template`);
    case TokenType.Number:
      throw new Error(`Unexpected token type '${tokenType}'`);
    default:
      enforceExhaustive(tokenType, `Unexpected token type`);
  }

  return value;
}
