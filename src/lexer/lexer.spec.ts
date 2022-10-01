import { Ast } from "../types/Ast";
import { createAst } from "./lexer";

describe("createAst", () => {
  it("parses an empty object with no properties", () => {
    const ast0 = createAst("{}");
    const ast1 = createAst("    {}");
    const ast2 = createAst("    {} \n");
    const ast3 = createAst(" \n{\n\n}\n ");
    const expectedAst: Ast = {
      type: "object",
      properties: [],
    };

    for (const ast of [ast0, ast1, ast2, ast3]) {
      expect(ast).toEqual(expectedAst);
    }
  });

  it("parses a single primitive property", () => {
    const ast_str = createAst("{a:string;}");
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
    const ast_str = createAst("{a:string;b:number}");
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
    const run = () => createAst("{a:unknown;}");
    const errorMessage = `Unknown symbol 'unknown'`;

    expect(run).toThrow(errorMessage);
  });

  it("parses object properties", () => {
    const ast = createAst("{a:{b:string}}");
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
    const ast = createAst("{a:{b:{c:string}}}");
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

  it("throws on an empty template", () => {
    const run0 = () => createAst("");
    const run1 = () => createAst("\n\n");
    const run2 = () => createAst("\n \t");

    for (const run of [run0, run1, run2]) {
      expect(run).toThrow(`Expected '{'`);
    }
  });

  it("throws if a closing brace is not provided for an object", () => {
    const run0 = () => createAst("{");
    const run1 = () => createAst("{a:string");
    const run2 = () => createAst("{a:string;b:number");
    const run3 = () => createAst("{a:string;b:{c:string};");

    for (const run of [run0, run1, run2, run3]) {
      expect(run).toThrow(`Unexpected end of template`);
    }
  });

  it("throws if a value is not provided for a property", () => {
    const unexpectedSemicolon = () => createAst("{a:;}");
    const unexpectedClosingBrace = () => createAst("{a:}");

    expect(unexpectedSemicolon).toThrow(`Unexpected token ';'`);
    expect(unexpectedClosingBrace).toThrow(`Unexpected token '}'`);
  });

  it("throws on tokens not in template syntax", () => {
    const unexpectedAt = () => createAst("{a:@;}");

    expect(unexpectedAt).toThrow(`Unexpected token '@'`);
  });
});
