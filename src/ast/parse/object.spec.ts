import { ParserState } from "../state/ParserState";
import { parseObject } from "./object";

describe("parseObject", () => {
  it("parses an empty object", () => {
    const state = new ParserState(`{}`);

    expect(() => parseObject(state)).not.toThrow();
  });

  it("correctly finds when there are no required properties", () => {
    const templates = [
      `{ a?: string; }`,
      `{ a: {} }`,
      `{ a?: string[] }`,
      `{ a: Record<string, number> }`,
      `{ a: { b?: number } }`,
      `{ a?: string; b: {}; c?: number[]; d: Record<string, { e: number; }> }`,
    ];

    for (const template of templates) {
      const state = new ParserState(template);

      const object = parseObject(state);

      expect(object.hasRequiredProperties).toEqual(false);
    }
  });

  it("correctly finds when there are required properties", () => {
    const templates = [`{ a: string; }`, `{ a: { b: { c: string } }; }`];

    for (const template of templates) {
      const state = new ParserState(template);

      const object = parseObject(state);

      expect(object.hasRequiredProperties).toEqual(true);
    }
  });
});
