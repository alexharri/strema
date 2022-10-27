import { PrimitiveNode, ValueNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseValue } from "./value";
import { parseObject } from "./object";

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

    const value = parseValue(state) as PrimitiveNode;

    expect(value.type).toEqual("primitive");
    expect(value.valueType).toEqual("string");
  });

  it("moves to the next token after the property", () => {
    const state = new ParserState(`string;`);

    parseValue(state);

    expect(state.token()).toEqual(";");
  });

  it("does not consider array notation after the primitive", () => {
    const state = new ParserState(`number[];`);

    const value = parseValue(state) as PrimitiveNode;

    expect(value.type).toEqual("primitive");
    expect(state.token()).toEqual("[");
  });

  it("does not consider rules after the primitive", () => {
    const state = new ParserState(`number <positive>;`);

    const value = parseValue(state) as PrimitiveNode;

    expect(value.rules.length).toEqual(0);
    expect(state.token()).toEqual("<");
  });

  it("parses objects by calling 'parseObject'", () => {
    const state = new ParserState(`{}`);
    const expectedValue: ValueNode = {
      type: "object",
      properties: [],
      optional: true,
    };

    const value = parseObject(state);

    expect(parseObject).toBeCalledTimes(1);
    expect(value).toEqual(expectedValue);
  });

  it("throws on unexpected symbols", () => {
    const state = new ParserState(`unknown;`);

    const parse = () => parseValue(state);

    expect(parse).toThrow(`Unknown primitive symbol 'unknown'`);
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
