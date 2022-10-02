import { ValidationError } from "../validate/ValidationError";
import { areValidationErrorsEqual } from "./compareError";

describe("areValidationErrorsEqual", () => {
  it("returns true for identical errors", () => {
    const base = {
      message: "Hello, world!",
      value: 50,
      ctx: { path: ["a", "b"] },
    };
    const a = new ValidationError({ ...base });
    const b = new ValidationError({ ...base });

    expect(areValidationErrorsEqual(a, b)).toEqual(true);
  });

  it("returns false if the path is different", () => {
    const base = { message: "Hello, world!", value: 50 };
    const a = new ValidationError({ ...base, ctx: { path: ["a", "b"] } });
    const b = new ValidationError({ ...base, ctx: { path: ["a", "c"] } });

    expect(areValidationErrorsEqual(a, b)).toEqual(false);
  });

  it("returns false if the value is different", () => {
    const base = { message: "Hello, world!", ctx: { path: ["a", "b"] } };
    const a = new ValidationError({ ...base, value: 10 });
    const b = new ValidationError({ ...base, value: "10" });

    expect(areValidationErrorsEqual(a, b)).toEqual(false);
  });

  it("returns false if the message is different", () => {
    const base = { value: 50, ctx: { path: ["a", "b"] } };
    const a = new ValidationError({ ...base, message: "A" });
    const b = new ValidationError({ ...base, message: "B" });

    expect(areValidationErrorsEqual(a, b)).toEqual(false);
  });

  it("compares the value shallowly", () => {
    const base = { message: "Hello, world!", ctx: { path: ["a", "b"] } };
    const a = new ValidationError({ ...base, value: { a: 1 } });
    const b = new ValidationError({ ...base, value: { a: 1 } });

    expect(areValidationErrorsEqual(a, b)).toEqual(false);
  });
});
