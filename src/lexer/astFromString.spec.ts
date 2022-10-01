import { Ast } from "../types/Ast";
import { astFromString } from "./astFromString";

describe("astFromString", () => {
  it("parses an empty object with no properties", () => {
    const ast = astFromString("{}");
    const expectedAst: Ast = { type: "object", properties: [] };

    expect(ast).toEqual(expectedAst);
  });

  it("parses a single primitive property", () => {
    const ast_str = astFromString("{a:string;}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: { type: "primitive", valueType: "string" },
        },
      ],
    };

    expect(ast_str).toEqual(expectedAst);
  });

  it("parses multiple primitive properties", () => {
    const ast_str = astFromString("{a:string;b:number}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: { type: "primitive", valueType: "string" },
        },
        {
          type: "property",
          key: "b",
          value: { type: "primitive", valueType: "number" },
        },
      ],
    };

    expect(ast_str).toEqual(expectedAst);
  });

  it("throws an error for non-primitive property symbols", () => {
    const run = () => astFromString("{a:unknown;}");
    const errorMessage = `Unknown symbol 'unknown'`;

    expect(run).toThrow(errorMessage);
  });

  it("parses object properties", () => {
    const ast = astFromString("{a:{b:string}}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: {
            type: "object",
            properties: [
              {
                type: "property",
                key: "b",
                value: { type: "primitive", valueType: "string" },
              },
            ],
          },
        },
      ],
    };

    expect(ast).toEqual(expectedAst);
  });

  it("parses nested object properties", () => {
    const ast = astFromString("{a:{b:{c:string}}}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: {
            type: "object",
            properties: [
              {
                type: "property",
                key: "b",
                value: {
                  type: "object",
                  properties: [
                    {
                      type: "property",
                      key: "c",
                      value: { type: "primitive", valueType: "string" },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    expect(ast).toEqual(expectedAst);
  });

  it("parses arrays of primitives", () => {
    const ast = astFromString("{a:string[]}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: {
            type: "array",
            value: { type: "primitive", valueType: "string" },
          },
        },
      ],
    };

    expect(ast).toEqual(expectedAst);
  });

  it("parses arrays of objects", () => {
    const ast = astFromString("{a:{b:string}[]}");
    const expectedAst: Ast = {
      type: "object",
      properties: [
        {
          type: "property",
          key: "a",
          value: {
            type: "array",
            value: {
              type: "object",
              properties: [
                {
                  type: "property",
                  key: "b",
                  value: { type: "primitive", valueType: "string" },
                },
              ],
            },
          },
        },
      ],
    };

    expect(ast).toEqual(expectedAst);
  });

  it("throws on an empty template", () => {
    const run0 = () => astFromString("");
    const run1 = () => astFromString("\n\n");
    const run2 = () => astFromString("\n \t");

    for (const run of [run0, run1, run2]) {
      expect(run).toThrow(`Expected '{'`);
    }
  });

  it("throws if a closing brace is not provided for an object", () => {
    const run0 = () => astFromString("{");
    const run1 = () => astFromString("{a:string");
    const run2 = () => astFromString("{a:string;b:number");
    const run3 = () => astFromString("{a:string;b:{c:string};");

    for (const run of [run0, run1, run2, run3]) {
      expect(run).toThrow(`Unexpected end of template`);
    }
  });

  it("throws if a value is not provided for a property", () => {
    const unexpectedSemicolon = () => astFromString("{a:;}");
    const unexpectedClosingBrace = () => astFromString("{a:}");

    expect(unexpectedSemicolon).toThrow(`Unexpected token ';'`);
    expect(unexpectedClosingBrace).toThrow(`Unexpected token '}'`);
  });

  it("throws on tokens not in template syntax", () => {
    const unexpectedAt = () => astFromString("{a:@;}");

    expect(unexpectedAt).toThrow(`Unexpected token '@'`);
  });
});
