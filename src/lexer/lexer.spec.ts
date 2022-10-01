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
                value: {
                  type: "primitive",
                  valueType: "string",
                },
              },
            ],
          },
        },
      ],
    };

    expect(ast).toEqual(expectedAst);
  });
});
