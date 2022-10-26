import { callNTimes } from "./callNTimes";

describe("callNTimes", () => {
  it("calls a function N times", () => {
    let result = 0;

    callNTimes(5, () => result++);

    expect(result).toEqual(5);
  });

  it("throws on non-finite number values", () => {
    const invalidValues = [NaN, Infinity, -Infinity];

    for (const value of invalidValues) {
      expect(() => callNTimes(value, () => {})).toThrow();
    }
  });

  it("ignores negative values", () => {
    let result = 0;

    callNTimes(-5, () => result++);

    expect(result).toEqual(0);
  });

  it("throws on non-numeric number values", () => {
    const invalidValues = ["0", {}, [], null];

    for (const value of invalidValues) {
      // @ts-expect-error
      expect(() => callNTimes(value, () => {})).toThrow();
    }
  });
});
