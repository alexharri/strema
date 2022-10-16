import { CompileError } from "./CompileError";
import { Parse } from "./Parse";
import { it, eq, not_eq } from "./Test";

it("returns an error if the string does not match '{...}'", () => [
  eq<Parse<``>, CompileError<["Expected {...}, got ''"]>>(),
  eq<Parse<`{`>, CompileError<["Expected {...}, got '{'"]>>(),
  eq<Parse<`}`>, CompileError<["Expected {...}, got '}'"]>>(),
  eq<Parse<`a: string;`>, CompileError<["Expected {...}, got 'a:string;'"]>>(),
]);

it("parses an empty object", () => [eq<Parse<`{}`>, {}>()]);

it("parses an object with a single property", () => [
  eq<Parse<`{ a: string; }`>, { a: string | null }>(),
]);

it("parses an object with multiple properties", () => [
  eq<
    Parse<`{ a: string; b: number; }`>,
    { a: string | null; b: number | null }
  >(),
]);

it("makes fields required if a default value is provided", () => [
  eq<Parse<`{ a: string = "Hello" }`>, { a: string }>(),
  eq<Parse<`{ a: { b: string = "Hello" } }`>, { a: { b: string } }>(),
  eq<Parse<`{ a: boolean = true }`>, { a: boolean }>(),
  eq<Parse<`{ a: number = 42 }`>, { a: number }>(),
]);

it("deals with problem characters in default values", () => [
  eq<Parse<`{ a: string = ";"; b: number = 42 }`>, { a: string; b: number }>(),
  eq<
    Parse<`{ a: string = ";a:{}"; b: number = 42 }`>,
    { a: string; b: number }
  >(),
  eq<
    Parse<`{ a: string <rules> = ";<>"; b: number = 42 }`>,
    { a: string; b: number }
  >(),
  eq<
    Parse<`{ a: string = "'a;:{}"; b: number = 42 }`>,
    { a: string; b: number }
  >(),

  /**
   * @todo We do not have a good way to deal with double quotes within
   * string values yet.
   */
  not_eq<
    Parse<`{ a: string = "";"; b: number = 42 }`>,
    { a: string; b: number }
  >(),
]);

it("does not require a trailing ';'", () => [
  eq<
    Parse<`{ a: string; b: number }`>,
    { a: string | null; b: number | null }
  >(),
]);

it("requires a ';' beween properties", () => [
  /**
   * @todo improve the error message for ',' between properties
   * @todo match the specific error that occurs
   */
  not_eq<
    Parse<`{ a: string, b: number }`>,
    { a: string | null; b: number | null }
  >(),
]);

it("parses arrays of primitives", () => [
  eq<Parse<`{ a: string[]; }`>, { a: string[] }>(),
  eq<
    Parse<`{ a: string[]; b: { c: number[] } }`>,
    { a: string[]; b: { c: number[] } }
  >(),
]);

it("ignores rules in '<>' for primitives", () => [
  eq<Parse<`{ a: string[] <abcd> }`>, { a: string[] }>(),
  eq<
    Parse<`{ a: string[] abcd }`>,
    {
      a: CompileError<
        [
          "Failed to parse value of property 'a'",
          "Expected one of [string, number, boolean] but got 'string[]abcd'"
        ]
      >;
    }
  >(),
]);

it("parses objects as properties", () => [eq<Parse<`{ a: {} }`>, { a: {} }>()]);

it("parses arrays of objects as properties", () => [
  // Array literal syntax
  eq<Parse<`{ a: { b: number }[] }`>, { a: Array<{ b: number | null }> }>(),

  // Named array syntax
  eq<
    Parse<`{ a: Array<{ b: number }> }`>,
    { a: Array<{ b: number | null }> }
  >(),
]);

it("parses nested object properties", () => [
  eq<Parse<`{ a: { b: {} } }`>, { a: { b: {} } }>(),
  eq<
    Parse<`{ a: { b: string; c: { d: number } } }`>,
    { a: { b: string | null; c: { d: number | null } } }
  >(),
]);

it("parses multiple object properties", () => [
  eq<
    Parse<`{ a: { b: { c: number } }; d: { e: {}; f: {} } }`>,
    { a: { b: { c: number | null } }; d: { e: {}; f: {} } }
  >(),
]);

it("errors when an invalid symbol is provided for a property value", () => {
  type Err = [
    "Failed to parse value of property 'a'",
    "Expected one of [string, number, boolean] but got 'notvalid'"
  ];

  return [eq<Parse<`{ a: notvalid }`>, { a: CompileError<Err> }>()];
});

it("returns a helpful error message if a key is not properly specified", () => [
  eq<
    Parse<`{a{}}`>,
    CompileError<["Expected key in format '<key>:', got 'a'"]>
  >(),
  eq<Parse<`{{}}`>, CompileError<["Expected a key before '{}'"]>>(),
  eq<Parse<`{{}[]}`>, CompileError<["Expected a key before 'Array<{}>'"]>>(),
]);
