import { NumberMinRule } from "../../types/Rule";
import { ParserState } from "../state/ParserState";
import { parseRule, parseRules } from "./rules";

describe("parseRule", () => {
  it("parses a single rule with no arguments", () => {
    const state = new ParserState(`positive`);

    const rule = parseRule(state, "number");

    expect(rule.type).toEqual("positive");
  });

  it("parses a single rule with an arguments", () => {
    const state = new ParserState(`min(5)`);

    const rule = parseRule(state, "number") as NumberMinRule;

    expect(rule.type).toEqual("min");
    expect(rule.value).toEqual(5);
  });

  it("moves to the next token after the rule", () => {
    {
      // With parens
      const state = new ParserState(`min(1), max(2)`);

      parseRule(state, "number");

      expect(state.token()).toEqual(",");
    }

    {
      // Without parens
      const state = new ParserState(`int, positive`);

      parseRule(state, "number");

      expect(state.token()).toEqual(",");
    }
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

    expect(parse).toThrow("Unknown string rule 'emial'");
  });

  it("throws an error if the primitive type does not match", () => {
    const state = new ParserState(`email`);

    const parse = () => parseRule(state, "number");

    expect(parse).toThrow("Unknown number rule 'email'");
  });
});

describe("parseRules", () => {
  it("parses a single rule", () => {
    const state = new ParserState(`<positive>`);

    const rules = parseRules(state, "number");

    expect(rules.length).toEqual(1);
  });

  it("parses multiple rules", () => {
    const state = new ParserState(`<max(10), int, min(5)>`);

    const rules = parseRules(state, "number");

    expect(rules.length).toEqual(3);
  });

  it("throws if no closing '>' is provided", () => {
    const state = new ParserState(`<positive, int;`);

    const parse = () => parseRules(state, "number");

    expect(parse).toThrow("Expected ',' or '>', got ';'");
  });
});
