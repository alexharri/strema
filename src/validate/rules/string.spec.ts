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
});
