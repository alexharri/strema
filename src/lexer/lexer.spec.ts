import { Ast } from "../types/Ast";
import { createAst } from "./lexer";

describe("parseObject", () => {
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
});
