import { SchemaValue } from "../types/Schema";
import { compileSchema } from "./compileSchema";

describe("compileSchema", () => {
  it("successfully compiles a schema and parses a value", () => {
    const schema = compileSchema(`{ a: string; b: number; }`);
    const value: SchemaValue<typeof schema> = { a: "Hello", b: 50 };

    const parsed = schema.parseSync(value);

    expect(parsed).toEqual(value);
  });

  it("copies the provided data instead of passing it as-is", () => {
    const schema = compileSchema(`{ a: { b: string; }; }`);
    const value: SchemaValue<typeof schema> = { a: { b: "Hello" } };

    const parsed = schema.parseSync(value);

    expect(parsed).toEqual(value);
    expect(parsed === value).toEqual(false);
    expect(parsed.a === value.a).toEqual(false);
  });
});
