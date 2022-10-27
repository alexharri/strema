import { ParserState } from "../state/ParserState";
import { parseObject } from "./object";

describe("parseObject", () => {
  it("parses an empty object", () => {
    const state = new ParserState(`{}`);

    expect(() => parseObject(state)).not.toThrow();
  });

  it("considers the object optional if there are no required properties", () => {
    const templates = [
      `{ a?: string; }`,
      `{ a: {} }`,
      `{ a: string[] }`,
      `{ a: Record<string, number> }`,
      `{ a: { b?: number } }`,
      `{ a?: string; b: {}; c: number[]; d: Record<string, { e: number; }> }`,
    ];

    for (const template of templates) {
      const state = new ParserState(template);

      const object = parseObject(state);

      expect(object.optional).toEqual(true);
    }
  });

  it("considers the object required if there is a required property", () => {
    const templates = [`{ a: string; }`, `{ a: { b: { c: string } }; }`];

    for (const template of templates) {
      const state = new ParserState(template);

      const object = parseObject(state);

      expect(object.optional).toEqual(false);
    }
  });
});
