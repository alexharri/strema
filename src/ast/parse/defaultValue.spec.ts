import { ParserState } from "../state/ParserState";
import { parseDefaultValue } from "./defaultValue";

describe("parseDefaultValue", () => {
  it("parses a string default value", () => {
    const state = new ParserState(`="Hello, world"`);

    const value = parseDefaultValue(state, "string");

    expect(value).toEqual("Hello, world");
  });

  it("handles escaped in string default values", () => {
    const state = new ParserState(`="Hello, \\"world\\""`);

    const value = parseDefaultValue(state, "string");

    expect(value).toEqual('Hello, "world"');
  });
});
