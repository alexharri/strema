import { compileSchema } from "../compile/compileSchema";

describe("validateRecord", () => {
  it("validates a primitive record", () => {
    const schema = compileSchema(`{ map: Record<string, number> }`);

    const map = { a: 1, b: 2, c: 3 };

    expect(() => schema.parseSync({ map })).not.toThrow();
  });
});
