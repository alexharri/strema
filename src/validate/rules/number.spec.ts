import { compileSchema } from "../../compile/compileSchema";

describe("validateNumberRule", () => {
  it("validates positive numbers", () => {
    const schema = compileSchema(`{ value: number <positive> }`);

    const positive = [0, -0, 1.5, 1, 55.1234, 103958, Number.MAX_SAFE_INTEGER];
    const notPositive = [-1, -0.0000000000001, -9999, -55.1234];

    const parse = (value: number) => () => schema.parseSync({ value });

    for (const value of positive) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of notPositive) {
      expect(parse(value)).toThrow("Number is not positive");
    }
  });
});
