import { PrimitiveNode, PrimitiveType, ValueNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseValue } from "./value";
import { parseObject } from "./object";
import { TokenType } from "../token";

const primitiveNode = (valueType: PrimitiveType): PrimitiveNode => ({
  type: "primitive",
  valueType,
  rules: [], // Rules are not parsed by 'parseValue'
});

jest.mock("./object", () => {
  const originalModule = jest.requireActual("./object");

  return {
    __esModule: true,
    parseObject: jest.fn((...args) => originalModule.parseObject(...args)),
  };
});

describe("parseValue", () => {
  it("parses a primitive value", () => {
    const state = new ParserState(`string;`);
    const expectedValue: ValueNode = primitiveNode("string");

    const value = parseValue(state);
    const nextToken = state.token();

    expect(value).toEqual(expectedValue);
    expect(nextToken).toEqual(";");
  });

  it("does not consider arrays", () => {
    const state = new ParserState(`number[];`);
    const expectedValue: ValueNode = primitiveNode("number");

    const value = parseValue(state);
    const nextToken = state.token();

    expect(value).toEqual(expectedValue);
    expect(nextToken).toEqual("[");
  });

  it("parses objects by calling 'parseObject'", () => {
    const state = new ParserState(`{}`);
    const expectedValue: ValueNode = { type: "object", properties: [] };

    const value = parseObject(state);
    const nextTokenType = state.tokenType();

    expect(parseObject).toBeCalledTimes(1);
    expect(value).toEqual(expectedValue);
    expect(nextTokenType).toEqual(TokenType.None);
  });

  it("throws on unexpected symbols", () => {
    const state = new ParserState(`unknown;`);

    const parse = () => parseValue(state);

    expect(parse).toThrow(`Unknown symbol 'unknown'`);
  });

  it("throws on unexpected delimeters", () => {
    const cases = [
      { template: `[]`, token: `[` },
      { template: `; a: string;`, token: `;` },
      { template: `<a: string>`, token: `<` },
      { template: `}; b: string;`, token: `}` },
    ];

    for (const { template, token } of cases) {
      const state = new ParserState(template);

      const parse = () => parseValue(state);

      expect(parse).toThrow(`Unexpected token '${token}'`);
    }
  });
});
