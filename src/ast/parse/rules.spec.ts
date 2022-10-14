import { Rule } from "../../types/Rule";
import { ParserState } from "../state/ParserState";
import { parseRule } from "./rules";

describe("parseRule", () => {
  it("parses a single rule with no arguments", () => {
    const state = new ParserState(`positive`);
    const expectedRule: Rule = { type: "positive" };

    const rule = parseRule(state, "number");

    expect(rule).toEqual(expectedRule);
  });

  it("parses a single rule with an arguments", () => {
    const state = new ParserState(`min(5)`);
    const expectedRule: Rule = { type: "min", value: 5 };

    const rule = parseRule(state, "number");

    expect(rule).toEqual(expectedRule);
  });

  it("moves to the next rule to parse", () => {
    const state = new ParserState(`min(1), max(2)`);
    const expectedRule: Rule = { type: "min", value: 1 };

    const rule = parseRule(state, "number");
    const nextToken = state.token();

    expect(rule).toEqual(expectedRule);
    expect(nextToken).toEqual("max");
  });

  it("allows for trailing ',' at the end of the list of rules", () => {
    const states = [
      new ParserState(`min(1),\n>`),
      new ParserState(`min(1),>`),
      new ParserState(`min(1)>`),
    ];
    const expectedRule: Rule = { type: "min", value: 1 };

    for (const state of states) {
      const rule = parseRule(state, "number");
      const nextToken = state.token();

      expect(rule).toEqual(expectedRule);
      expect(nextToken).toEqual(">");
    }
  });

  it("throws an error if multiple arguments are provided", () => {
    const state = new ParserState(`min(1, 2)`);

    const parse = () => parseRule(state, "number");

    expect(parse).toThrow("Unexpected token ',', expected ')'");
  });

  it("throws an error if it does not encounter a rule name", () => {
    const state = new ParserState(`,min(1, 2)`);

    const parse = () => parseRule(state, "number");

    expect(parse).toThrow("Expected rule name, got ','");
  });
});
