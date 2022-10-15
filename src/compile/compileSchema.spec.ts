import { SchemaValue } from "../types/Schema";
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
    let thrown!: ValidationError;

    try {
      schema.parseSync({ a: "string" });
    } catch (e) {
      thrown = e as ValidationError;
    }

    expect(thrown.message).toEqual("Expected number value, got string");
  });

  it("correctly constructs the error path", () => {
    const schema = compileSchema(`{ a: { b: number[] } }`);
    let thrown!: ValidationError;

    try {
      schema.parseSync({ a: { b: [0, 1, "2"] } });
    } catch (e) {
      thrown = e as ValidationError;
    }

    expect(thrown.path).toEqual("a.b[2]");
  });

  it("contains the value that did not match the spec in the error", () => {
    const schema = compileSchema(`{ a: { b: number[] } }`);
    let thrown!: ValidationError;

    try {
      schema.parseSync({ a: { b: [0, 1, "2"] } });
    } catch (e) {
      thrown = e as ValidationError;
    }

    expect(thrown.value).toEqual("2");
  });

  it("throws an instance of ValidationError when an error occurs", () => {
    const schema = compileSchema(`{ a: number }`);
    let thrown!: ValidationError;

    try {
      schema.parseSync({ a: "string" });
    } catch (e) {
      thrown = e as ValidationError;
    }

    expect(thrown instanceof ValidationError).toEqual(true);
  });
});
