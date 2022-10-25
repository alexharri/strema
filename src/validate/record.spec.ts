import { compileSchema } from "../compile/compileSchema";

describe("validateRecord", () => {
  it("validates a primitive record", () => {
    const schema = compileSchema(`{ map: Record<string, number> }`);
    const map = { a: 1, b: 2, c: 3 };

    expect(() => schema.parseSync({ map })).not.toThrow();
  });

  it("rejects non-numeric keys when the key type is numeric", () => {
    const schema = compileSchema(`{ map: Record<number, string> }`);
    const map = { 1: "a", 2: "b", three: "c" };

    expect(() => schema.parseSync({ map })).toThrow(
      "Expected numeric key, got 'three'"
    );
  });

  it("rejects non-numeric keys that pass parseInt", () => {
    const schema = compileSchema(`{ map: Record<number, string> }`);
    const map = { 1: "a", 2: "b", "3a": "c" };

    expect(() => schema.parseSync({ map })).toThrow(
      "Expected numeric key, got '3a'"
    );
  });

  it("accepts floats as numeric keys", () => {
    const schema = compileSchema(`{ map: Record<number, string> }`);
    const map = { 1: "a", 2: "b", "3.1": "c" };

    expect(() => schema.parseSync({ map })).not.toThrow();
  });
});
