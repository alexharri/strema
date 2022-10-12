import { ValueNode } from "../../types/Ast";
import { AstState } from "../state/AstState";
import { parseValue } from "./value";
import { parseObject } from "./object";
import { TokenType } from "../token";

jest.mock("./object", () => {
  const originalModule = jest.requireActual("./object");

  return {
    __esModule: true,
    parseObject: jest.fn((...args) => originalModule.parseObject(...args)),
  };
});

describe("parsePropertyValue", () => {
  it("parses a primitive value", () => {
    const state = new AstState(`string;`);
    const expectedValue: ValueNode = { type: "primitive", valueType: "string" };

    const value = parseValue(state);
    const nextToken = state.token();

    expect(value).toEqual(expectedValue);
    expect(nextToken).toEqual(";");
  });

  it("does not consider arrays", () => {
    const state = new AstState(`number[];`);
    const expectedValue: ValueNode = { type: "primitive", valueType: "number" };

    const value = parseValue(state);
    const nextToken = state.token();

    expect(value).toEqual(expectedValue);
    expect(nextToken).toEqual("[");
  });

  it("parses objects by calling 'parseObject'", () => {
    const state = new AstState(`{}`);
    const expectedValue: ValueNode = { type: "object", properties: [] };

    const value = parseObject(state);
    const nextTokenType = state.tokenType();

    expect(parseObject).toBeCalledTimes(1);
    expect(value).toEqual(expectedValue);
    expect(nextTokenType).toEqual(TokenType.None);
  });

  it("throws on unexpected symbols", () => {
    const state = new AstState(`unknown;`);

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
      const state = new AstState(template);

      const parse = () => parseValue(state);

      expect(parse).toThrow(`Unexpected token '${token}'`);
    }
  });
});
