import { compileSchema } from "../../compile/compileSchema";

describe("validateNumberRule", () => {
  it("enforces the 'positive' rule", () => {
    const schema = compileSchema(`{ value: number <positive> }`);
    const parse = (value: number) => () => schema.parseSync({ value });

    const positive = [0, -0, 1.5, 1, 55.1234, 103958, Number.MAX_SAFE_INTEGER];
    const notPositive = [-1, -0.0000000000001, -9999, -55.1234];

    for (const value of positive) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of notPositive) {
      expect(parse(value)).toThrow("Number is not positive");
    }
  });

  it("enforces the 'int' rule", () => {
    const schema = compileSchema(`{ value: number <int> }`);
    const parse = (value: number) => () => schema.parseSync({ value });

    const ints = [0, -0, 1, -1, 55, 103958, -19372, Number.MAX_SAFE_INTEGER];
    const notInts = [1 + Number.EPSILON, 0.1, 5.000000123, -55.1234, -0.1];

    for (const value of ints) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of notInts) {
      expect(parse(value)).toThrow("Number is not an integer");
    }
  });
});
