import { ParserState } from "../state/ParserState";
import { parseDefaultValue } from "./defaultValue";

describe("parseDefaultValue", () => {
  it("returns null if the next token is not '='", () => {
    const templates = [`"Hello, world"`, `<rules>`, `; a: string;`];

    for (const template of templates) {
      const state = new ParserState(template);

      const value = parseDefaultValue(state, "string");

      expect(value).toEqual(null);
    }
  });

  it("parses a string default value", () => {
    const state = new ParserState(`= "Hello, world"`);

    const value = parseDefaultValue(state, "string");

    expect(value).toEqual("Hello, world");
  });

  it("handles escaped double quotes in string default values", () => {
    const state = new ParserState(`= "Hello, \\"world\\""`);

    const value = parseDefaultValue(state, "string");

    expect(value).toEqual('Hello, "world"');
  });

  it("parses a number default value", () => {
    const state = new ParserState(`= 42`);

    const value = parseDefaultValue(state, "number");

    expect(value).toEqual(42);
  });

  it("parses a number default value", () => {
    const state = new ParserState(`= 42`);

    const value = parseDefaultValue(state, "number");

    expect(value).toEqual(42);
  });

  it("parses a boolean default value", () => {
    const state = new ParserState(`= false`);

    const value = parseDefaultValue(state, "boolean");

    expect(value).toEqual(false);
  });

  it("throws if an incorrect default value for a string is provided", () => {
    const numberState = new ParserState(`= 42`);
    const booleanState = new ParserState(`= true`);

    const parseNumber = () => parseDefaultValue(numberState, "string");
    const parseBoolean = () => parseDefaultValue(booleanState, "string");

    expect(parseNumber).toThrow("Expected string, got '42'");
    expect(parseBoolean).toThrow("Expected string, got 'true'");
  });

  it("throws if an incorrect default value for a number is provided", () => {
    const stringState = new ParserState(`= "42"`);
    const booleanState = new ParserState(`= true`);

    const parseString = () => parseDefaultValue(stringState, "number");
    const parseBoolean = () => parseDefaultValue(booleanState, "number");

    expect(parseString).toThrow("Expected number, got '\"42\"'");
    expect(parseBoolean).toThrow("Expected number, got 'true'");
  });

  it("throws if an incorrect default value for a boolean is provided", () => {
    const stringState = new ParserState(`= "Hello, world"`);
    const numberState = new ParserState(`= 42`);

    const parseString = () => parseDefaultValue(stringState, "boolean");
    const parseNumber = () => parseDefaultValue(numberState, "boolean");

    expect(parseString).toThrow("Expected boolean, got '\"Hello, world\"'");
    expect(parseNumber).toThrow("Expected boolean, got '42'");
  });
});
