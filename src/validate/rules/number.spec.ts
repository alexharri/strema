import { compileSchema } from "../../compile/compileSchema";

function createParseFunction(rules: `<${string}>`) {
  const schema = compileSchema(`{ value: number ${rules} }`);
  return (value: number) => () => schema.parseSync({ value });
}

describe("validateNumberRule", () => {
  it("enforces the 'positive' rule", () => {
    const parse = createParseFunction(`<positive>`);

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
    const parse = createParseFunction(`<int>`);

    const ints = [0, -0, 1, -1, 55, 103958, -19372, Number.MAX_SAFE_INTEGER];
    const notInts = [1 + Number.EPSILON, 0.1, 5.000000123, -55.1234, -0.1];

    for (const value of ints) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of notInts) {
      expect(parse(value)).toThrow("Number is not an integer");
    }
  });

  it("enforces the 'min' rule", () => {
    const parse = createParseFunction(`<min(5)>`);

    const fiveOrHigher = [5, 10, Number.MAX_SAFE_INTEGER, 5.5];
    const lowerThanFive = [0, -5, 4.999999999999998, 1];

    for (const value of fiveOrHigher) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of lowerThanFive) {
      expect(parse(value)).toThrow("Number is lower than '5'");
    }
  });
});
