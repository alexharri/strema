import { compileSchema } from "./compileSchema";

describe("compileSchema", () => {
  it("successfully compiles a schema and parses a value", () => {
    const schema = compileSchema(`{ a: string; b: number; }`);
    const value = { a: "Hello", b: 50 };

    const parsed = schema.parseSync(value);

    expect(parsed).toEqual(value);
  });
});
