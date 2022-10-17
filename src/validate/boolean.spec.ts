import { compileSchema } from "../compile/compileSchema";
import { typeAsString } from "../format/typeAsString";

describe("validateBoolean", () => {
  const schema = compileSchema(`{ value: boolean; }`);
  const parse = (value: unknown) => () => schema.parseSync({ value });

  it("accepts boolean values", () => {
    const values = [true, false];

    for (const value of values) {
      expect(parse(value)).not.toThrow();
    }
  });

  it("accepts null or undefined values", () => {
    const values = [null, undefined];

    for (const value of values) {
      expect(parse(value)).not.toThrow();
    }
  });

  it("rejects non-boolean values", () => {
    const values = ["Hello", 1, { value: true }, [true]];

    for (const value of values) {
      expect(parse(value)).toThrow(
        `Expected boolean value, got ${typeAsString(value)}`
      );
    }
  });

  it("returns null if no default is present and the value is null or undefined", () => {
    const schema = compileSchema(`{ value: boolean; }`);
    const values = [null, undefined];

    for (const value of values) {
      const parsed = schema.parseSync({ value });

      expect(parsed.value).toEqual(null);
    }
  });

  it("returns the default value for a boolean", () => {
    const schema = compileSchema(`{ value: boolean = true; }`);

    const { value } = schema.parseSync({ value: null });

    expect(value).toEqual(true);
  });
});
