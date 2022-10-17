import { compileSchema } from "../compile/compileSchema";

describe("object", () => {
  it("always accepts an empty object", () => {
    const schema = compileSchema(
      `{ a: string; b: number = 1; c: { d: string }; e: number[]; }`
    );

    expect(() => schema.parseSync({})).not.toThrow();
  });

  it("initializes a primitive property that is not provided with null", () => {
    const schema = compileSchema(`{ a: string }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual(null);
  });

  it("initializes object properties that are not provided", () => {
    const schema = compileSchema(`{ a: {} }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual({});
  });

  it("initializes array properties that are not provided", () => {
    const schema = compileSchema(`{ a: number[] }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual([]);
  });

  it("initializes nested object properties that are not provided", () => {
    const schema = compileSchema(`{ a: { b: string; } }`);

    const parsed = schema.parseSync({});

    expect(parsed.a.b).toEqual(null);
  });

  it("throws if a non-object value is passed to 'parseSync'", () => {
    const schema = compileSchema(`{}`);

    expect(() => schema.parseSync(null)).toThrow();
    expect(() => schema.parseSync("Hello, world")).toThrow();
    expect(() => schema.parseSync(123)).toThrow();
    expect(() => schema.parseSync([])).toThrow();
    expect(() => schema.parseSync(new Map())).toThrow();
  });
});
