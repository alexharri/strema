import { ArrayNode, ObjectNode, PrimitiveNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseProperties, parseProperty } from "./property";

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

  it("parses an array of primitives or objects", () => {
    const templates = [
      { template: `a: string[]`, type: "primitive" },
      { template: `a: {}[]`, type: "object" },
    ];

    for (const { template, type } of templates) {
      const state = new ParserState(template);

      const property = parseProperty(state);
      const value = property.value as ArrayNode;

      expect(property.key).toEqual("a");
      expect(value.type).toEqual("array");
      expect(value.value.type).toEqual(type);
    }
  });

  it("parses the rules for an array of primitives", () => {
    const state = new ParserState(`emails: string[] <email>`);

    const value = parseProperty(state).value as ArrayNode;
    const primitive = value.value as PrimitiveNode;

    expect(primitive.rules.length).toEqual(1);
  });
});

describe("parseProperties", () => {
  // An object is opened with the '{' token, so a closing '}' is expected after
  // parsing the object's properties.
  //
  // 'parseProperties' is called after processing the opening '{'.
  it("throws if a closing '}' is not present", () => {
    const state = new ParserState(`a: string <email>;`);

    const parse = () => parseProperties(state);

    expect(parse).toThrow("Unexpected end of template");
  });

  it("does not process the closing '}'", () => {
    const state = new ParserState(`a: string <email>; } <`);

    parseProperties(state);

    expect(state.token()).toEqual("}");
    expect(state.token()).not.toEqual("<");
  });

  it("parses a single property", () => {
    const state = new ParserState(`a: string <email>; }`);

    const properties = parseProperties(state);

    expect(properties.length).toEqual(1);
  });

  it("parses multiple properties", () => {
    const state = new ParserState(
      `a: string <email>; c: { d: string[] }; b: number[] <int>; }`
    );

    const properties = parseProperties(state);

    expect(properties.length).toEqual(3);
  });

  it("does not parse rules for object properties", () => {
    const state = new ParserState(`a: { b: number; } <rule> }`);

    const parse = () => parseProperties(state);

    expect(parse).toThrow("Unexpected token '<'");
  });
});
