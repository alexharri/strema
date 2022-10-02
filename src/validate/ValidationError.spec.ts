import { ValidationError } from "./ValidationError";

describe("ValidationError", () => {
  it("contains the expected properties", () => {
    const err = new ValidationError({
      message: "Hello, world!",
      value: 50,
      ctx: { path: ["a", "b"] },
    });
    expect(err.name).toEqual("ValidationError");
    expect(err.message).toEqual("Hello, world!");
    expect(err.value).toEqual(50);
    expect(err.path).toEqual("a.b");
  });
});
