import { compileSchema } from "../../compile/compileSchema";

function createParseFunction(rules: `<${string}>`) {
  const schema = compileSchema(`{ value: string ${rules} }`);
  return (value: string) => () => schema.parseSync({ value });
}

describe("validateStringRule", () => {
  it("enforces the 'email' rule", () => {
    const parse = createParseFunction(`<email>`);

    const emails = [
      "alex@gmail.com",
      "john@example.co.uk",
      "jane.doe@example.com",
    ];
    const notEmails = ["some@value", "Not an email in any way"];

    for (const value of emails) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of notEmails) {
      expect(parse(value)).toThrow("Invalid email address");
    }
  });

  it("enforces the min rule", () => {
    const parse = createParseFunction(`<min(2)>`);

    const atLeastTwo = ["ab", "abcdefg", "A string"];
    const lessThanTwo = ["", "a"];

    for (const value of atLeastTwo) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of lessThanTwo) {
      expect(parse(value)).toThrow("String length must be lower than 2");
    }
  });

  it("enforces the max rule", () => {
    const parse = createParseFunction(`<max(4)>`);

    const fourOrLower = ["abcd", "", "."];
    const higherThanFour = ["Hello", "Hi, how are you?"];

    for (const value of fourOrLower) {
      expect(parse(value)).not.toThrow();
    }
    for (const value of higherThanFour) {
      expect(parse(value)).toThrow("String length must not exceed 4");
    }
  });
});
