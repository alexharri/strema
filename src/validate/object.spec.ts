import { compileSchema } from "../compile/compileSchema";

describe("object", () => {
  it("does not accept an empty object if there are required fields", () => {
    const schema = compileSchema(
      `{ a: string; b?: number = 1; c: { d: string }; e: number[]; }`
    );

    expect(() => schema.parseSync({})).toThrow("Field 'a' is required");
  });

  it("initializes an optional primitive property that is not provided with null", () => {
    const schema = compileSchema(`{ a?: string }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual(null);
  });

  it("does not throw if required object properties with no properties are not provided", () => {
    const schema = compileSchema(`{ a: {} }`);

    const parse = () => schema.parseSync({});

    expect(parse).not.toThrow();
  });

  it("does not throw if required object properties with no required properties are not provided", () => {
    const schema = compileSchema(`{ a: { b?: number } }`);

    const parse = () => schema.parseSync({});

    expect(parse).not.toThrow();
  });

  it("initializes default values of properties of object properties that are not provided", () => {
    const schema = compileSchema(`{ a: { b?: number = 42 } }`);

    const parsed = schema.parseSync({});

    expect(parsed.a.b).toEqual(42);
  });

  it("throws if required object properties with required properties are not provided", () => {
    const schema = compileSchema(`{ a: { value: number } }`);

    const parse = () => schema.parseSync({});

    expect(parse).toThrow("Field 'a' is required");
  });

  it("initializes optional object properties with required properties that are not provided to null", () => {
    const schema = compileSchema(`{ a?: { value: number } }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual(null);
  });

  it("requires non-optional array properties to be provided", () => {
    const schema = compileSchema(`{ a: number[] }`);

    const parse = () => schema.parseSync({});

    expect(parse).toThrow("Field 'a' is required");
  });

  it("initializes optional array properties that are not provided to null", () => {
    const schema = compileSchema(`{ a?: number[] }`);

    const parsed = schema.parseSync({});

    expect(parsed.a).toEqual(null);
  });

  it("initializes optional fields of object properties that are not provided", () => {
    const schema = compileSchema(`{ a: { b?: string; } }`);

    const parsed = schema.parseSync({ a: {} });

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
