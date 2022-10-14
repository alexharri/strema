import { Rule } from "../../types/Rule";
import { ParserState } from "../state/ParserState";
import { parseRule, parseRules } from "./rules";

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

  it("moves to the next token after the rule", () => {
    const state = new ParserState(`min(1), max(2)`);
    const expectedRule: Rule = { type: "min", value: 1 };

    const rule = parseRule(state, "number");
    const nextToken = state.token();

    expect(rule).toEqual(expectedRule);
    expect(nextToken).toEqual(",");
  });

  it("throws an error if an argument is provided ", () => {
    const state = new ParserState(`int(2)`);

    const parse = () => parseRule(state, "number");

    expect(parse).toThrow("Rule 'int' expects no arguments.");
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

  it("throws an error if an unknown rule name is provided", () => {
    const state = new ParserState(`emial`);

    const parse = () => parseRule(state, "string");

    expect(parse).toThrow("Unknown rule 'emial'");
  });

  it("throws an error if the primitive type does not match", () => {
    const state = new ParserState(`email`);

    const parse = () => parseRule(state, "number");

    expect(parse).toThrow(
      "Rule 'email' expects a string, you provided a number value"
    );
  });
});

describe("parseRules", () => {
  it("parses a single rule", () => {
    const state = new ParserState(`<positive>`);
    const expectedRules: Rule[] = [{ type: "positive" }];

    const rules = parseRules(state, "number");

    expect(rules).toEqual(expectedRules);
  });

  it("parses multiple rules", () => {
    const state = new ParserState(`<positive, int>`);
    const expectedRules: Rule[] = [{ type: "positive" }, { type: "int" }];

    const rules = parseRules(state, "number");

    expect(rules).toEqual(expectedRules);
  });

  it("throws if no closing '>' is provided", () => {
    const state = new ParserState(`<positive, int;`);

    const parse = () => parseRules(state, "number");

    expect(parse).toThrow("Expected ',' or '>', got ';'");
  });
});
