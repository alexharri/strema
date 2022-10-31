import { compileSchema } from "../compile/compileSchema";

describe("validatePrimitive", () => {
  it("requires that fields be present by default", () => {
    const schema = compileSchema(`{ value: string }`);

    expect(() => schema.parseSync({ value: null })).toThrow(
      "Field 'value' is required"
    );
  });
});
