import { SchemaValue } from "../types/Schema";
import { areValidationErrorsEqual } from "../util/compareError";
import { ValidationError } from "../validate/ValidationError";
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

  it("only copies the properties specified in the schema template", () => {
    const schema = compileSchema(`{ a: number; b: number; }`);
    const value = { a: 1, b: 2, c: 3 };

    const parsed = schema.parseSync(value);

    expect(parsed).toEqual({ a: 1, b: 2 });
    // The original value should not be modified
    expect(value).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("throws an error when a value is of the wrong type", () => {
    const schema = compileSchema(`{ a: number }`);
    const value = { a: "string" };
    const parse = () => schema.parseSync(value);
    const expectedError = new ValidationError({
      message: "Expected number value, got string",
      value: "string",
      ctx: { path: ["a"] },
    });

    let thrown!: ValidationError;
    try {
      parse();
    } catch (e) {
      thrown = e;
    }

    expect(areValidationErrorsEqual(thrown, expectedError)).toEqual(true);
  });
});
