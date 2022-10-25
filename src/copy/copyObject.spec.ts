import { astFromString } from "../ast/astFromString";
import { copyObject } from "./copyObject";

describe("copyObject", () => {
  it("creates a new object", () => {
    const ast = astFromString(`{ a: string; }`);
    const original = { a: "Hello" };

    const copied = copyObject(original, ast);

    expect(copied === original).toEqual(false);
  });

  it("copies primitives", () => {
    const ast = astFromString(`{ a: string; b: number; c: boolean }`);
    const original = { a: "Hello", b: 1, c: true };

    const copied = copyObject(original, ast);

    expect(copied).toEqual(original);
  });

  it("copies every key, even if not in the original object", () => {
    const ast = astFromString(`{ a: string; b: number; c: boolean }`);

    const copied = copyObject({}, ast);

    expect(copied).toHaveProperty("a");
    expect(copied).toHaveProperty("b");
    expect(copied).toHaveProperty("c");
  });

  it("creates a new object for object properties", () => {
    const ast = astFromString(`{ a: {}; }`);
    const original = { a: {} };

    const copied: any = copyObject(original, ast);

    expect(copied.a === original.a).toEqual(false);
  });

  it("initializes primitives that are not present with null", () => {
    const ast = astFromString(`{ a: string; b: number; c: boolean }`);

    const copied: any = copyObject({}, ast);

    expect(copied.a).toEqual(null);
    expect(copied.b).toEqual(null);
    expect(copied.c).toEqual(null);
  });

  it("uses the default value when the property is not provided", () => {
    const ast = astFromString(`{ value: number = 42 }`);

    const copied: any = copyObject({}, ast);

    expect(copied.value).toEqual(42);
  });

  it("does not override the value with the default if provided", () => {
    const ast = astFromString(`{ value: number = 42 }`);

    const copied: any = copyObject({ value: 1 }, ast);

    expect(copied.value).toEqual(1);
  });

  it("does not override a falsy value with the default if provided", () => {
    const ast = astFromString(`{ value: number = 42 }`);

    const copied: any = copyObject({ value: 0 }, ast);

    expect(copied.value).toEqual(0);
  });

  it("overrides null values with the default", () => {
    const ast = astFromString(`{ value: number = 42 }`);

    const copied: any = copyObject({ value: null }, ast);

    expect(copied.value).toEqual(42);
  });

  it("overrides undefined values with the default", () => {
    const ast = astFromString(`{ value: number = 42 }`);

    const copied: any = copyObject({ value: undefined }, ast);

    expect(copied.value).toEqual(42);
  });

  it("initializes arrays with empty arrays if not provided", () => {
    const ast = astFromString(`{ ints: number[] }`);

    const copied: any = copyObject({}, ast);

    expect(copied.ints).toEqual([]);
  });

  it("initializes arrays with empty arrays if null is provided", () => {
    const ast = astFromString(`{ ints: number[] }`);

    const copied: any = copyObject({ ints: null }, ast);

    expect(copied.ints).toEqual([]);
  });

  it("initializes arrays with empty arrays if undefined is provided", () => {
    const ast = astFromString(`{ ints: number[] }`);

    const copied: any = copyObject({ ints: undefined }, ast);

    expect(copied.ints).toEqual([]);
  });

  it("initializes objects if not provided", () => {
    const ast = astFromString(`{ obj: {} }`);

    const copied: any = copyObject({}, ast);

    expect(copied.obj).toEqual({});
  });

  it("initializes objects if null is provided", () => {
    const ast = astFromString(`{ obj: {} }`);

    const copied: any = copyObject({ obj: null }, ast);

    expect(copied.obj).toEqual({});
  });

  it("initializes objects if undefined is provided", () => {
    const ast = astFromString(`{ obj: {} }`);

    const copied: any = copyObject({ obj: undefined }, ast);

    expect(copied.obj).toEqual({});
  });

  it("initializes properties of objects if the object is not provided", () => {
    const ast = astFromString(`{ obj: { value: number } }`);

    const copied: any = copyObject({}, ast);

    expect(copied.obj).toEqual({ value: null });
  });

  it("initializes properties of objects with their default values if the object is not provided", () => {
    const ast = astFromString(`{ obj: { value: number = 42 } }`);

    const copied: any = copyObject({}, ast);

    expect(copied.obj).toEqual({ value: 42 });
  });

  it("initializes records to an empty object if not provided", () => {
    const ast = astFromString(`{ map: Record<string, {}> }`);

    const copied: any = copyObject({}, ast);

    expect(copied).toEqual({ map: {} });
  });

  it("copies the elements of a record", () => {
    const ast = astFromString(`{ map: Record<string, number> }`);

    const copied: any = copyObject({ map: { a: 1, b: 2, c: 3 } }, ast);

    expect(copied.map).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("creates new objects for record properties", () => {
    const ast = astFromString(`{ map: Record<string, { value: number }> }`);
    const obj = { value: 42 };

    const copied: any = copyObject({ map: { obj } }, ast);

    expect(copied.map.obj).toEqual(obj);
    expect(copied.map.obj === obj).toEqual(false);
  });

  it("omits null or undefined properties for records", () => {
    const ast = astFromString(`{ map: Record<string, number> }`);
    const map = { a: 1, b: null, c: undefined };

    const copied = copyObject({ map }, ast) as any;

    expect(copied.map).toHaveProperty("a");
    expect(copied.map).not.toHaveProperty("b");
    expect(copied.map).not.toHaveProperty("c");
  });
});
