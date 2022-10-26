import { compileSchema } from "../compile/compileSchema";

describe("validateArray", () => {
  function createParseFunction<T extends string>(s: T) {
    const schema = compileSchema(`{ value: ${s}; }`);
    const parse = (value: unknown) => () => schema.parseSync({ value });
    return parse;
  }

  it("accepts an array of primitives of the correct type", () => {
    const parse = createParseFunction(`number[]`);
    const numberArrays = [[-1, 0, 1], [], [50]];

    for (const value of numberArrays) {
      expect(parse(value)).not.toThrow();
    }
  });

  it("rejects arrays with invalid values", () => {
    const parse = createParseFunction(`number[]`);
    const notNumberArrays = [[-1, 0, "1"], [Infinity], [[]], [1, {}], ["1"]];

    for (const value of notNumberArrays) {
      expect(parse(value)).toThrow();
    }
  });

  it("accepts arrays of objects that match the object schema", () => {
    const parse = createParseFunction(`{ val: number <positive> }[]`);
    const validArrays = [[{ val: 0 }, { val: 1 }], [], [{ val: 1000 }]];

    for (const value of validArrays) {
      expect(parse(value)).not.toThrow();
    }
  });

  it("rejects arrays of objects that do not match the object schema", () => {
    const parse = createParseFunction(`{ val: number <positive> }[]`);
    const validArrays = [
      [{ val: 0 }, { val: 1 }, { val: "2" }],
      [50],
      [{ val: -1 }],
      [{ val: [] }],
    ];

    for (const value of validArrays) {
      expect(parse(value)).toThrow();
    }
  });
});
