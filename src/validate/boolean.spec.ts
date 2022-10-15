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

  it("rejects non-boolean values", () => {
    const values = ["Hello", 1, { value: true }, [true]];

    for (const value of values) {
      expect(parse(value)).toThrow(
        `Expected boolean value, got ${typeAsString(value)}`
      );
    }
  });
});
