import { ObjectNode, PrimitiveNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseProperty } from "./property";

describe("parseProperty", () => {
  it("parses the key and value of a primitive property", () => {
    const state = new ParserState(`a: string`);

    const parsed = parseProperty(state);
    const value = parsed.value as PrimitiveNode;

    expect(parsed.key).toEqual("a");
    expect(value.type).toEqual("primitive");
    expect(value.valueType).toEqual("string");
  });

  it("parses a single rule for a primitive property", () => {
    const state = new ParserState(`a: string <email>`);

    const value = parseProperty(state).value as PrimitiveNode;

    expect(value.rules.length).toEqual(1);
    expect(value.rules[0].type).toEqual("email");
  });

  it("parses a list of rules for a primitive property", () => {
    const state = new ParserState(`a: number <int, positive>`);

    const value = parseProperty(state).value as PrimitiveNode;

    expect(value.rules.length).toEqual(2);
  });

  it("parses an object property", () => {
    const state = new ParserState(`a: {}`);

    const value = parseProperty(state).value;

    expect(value.type).toEqual("object");
  });

  it("parses the properties of an object property", () => {
    const state = new ParserState(`a: { b: number; c: string }`);

    const value = parseProperty(state).value as ObjectNode;

    expect(value.properties.length).toEqual(2);
  });
});
