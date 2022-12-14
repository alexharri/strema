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
  eq<Parse<`{ a: string; }`>, { a: string }>(),
]);

it("parses an object with multiple properties", () => [
  eq<Parse<`{ a: string; b: number; }`>, { a: string; b: number }>(),
]);

it("parses optional fields", () => [
  eq<Parse<`{ a?: string }`>, { a: string | null }>(),
  eq<Parse<`{ a: { b?: string } }`>, { a: { b: string | null } }>(),
  eq<Parse<`{ a?: boolean }`>, { a: boolean | null }>(),
  eq<Parse<`{ a?: number }`>, { a: number | null }>(),
  eq<Parse<`{ a?: number[] }`>, { a: number[] | null }>(),
  eq<Parse<`{ a?: number[] <int> }`>, { a: number[] | null }>(),
  eq<Parse<`{ a?: {} }`>, { a: {} | null }>(),
  eq<Parse<`{ a?: { b: string } }`>, { a: { b: string } | null }>(),
  eq<Parse<`{ a?: { b?: string } }`>, { a: { b: string | null } | null }>(),
]);

it("makes optional fields always present if a default value is provided", () => [
  eq<Parse<`{ a?: string = "Hello" }`>, { a: string }>(),
  eq<Parse<`{ a: { b?: string = "Hello" } }`>, { a: { b: string } }>(),
  eq<Parse<`{ a?: boolean = true }`>, { a: boolean }>(),
  eq<Parse<`{ a?: number = 42 }`>, { a: number }>(),
]);

it("does not support optional record properties", () => [
  eq<
    Parse<`{ a?: Record<string, string> }`>,
    {
      a: CompileError<
        [
          "Failed to parse value of property 'a'",
          "Type cannot be optional",
          Record<string, string>
        ]
      >;
    }
  >(),
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
]);

it("allows double quotes to be escaped via '\\\"'", () => [
  eq<
    Parse<`{ a: string = "\\";"; b: number = 42 }`>,
    { a: string; b: number }
  >(),
]);

it("does not require a trailing ';'", () => [
  eq<Parse<`{ a: string; b: number }`>, { a: string; b: number }>(),
]);

it("requires a ';' beween properties", () => [
  /**
   * @todo improve the error message for ',' between properties
   * @todo match the specific error that occurs
   */
  not_eq<Parse<`{ a: string, b: number }`>, { a: string; b: number }>(),
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
  eq<Parse<`{ a: { b: number }[] }`>, { a: { b: number }[] }>(),

  // Named array syntax
  eq<Parse<`{ a: { b: number }[] }`>, { a: { b: number }[] }>(),
]);

it("parses nested object properties", () => [
  eq<Parse<`{ a: { b: {} } }`>, { a: { b: {} } }>(),
  eq<
    Parse<`{ a: { b: string; c: { d: number } } }`>,
    { a: { b: string; c: { d: number } } }
  >(),
]);

it("parses multiple object properties", () => [
  eq<
    Parse<`{ a: { b: { c: number } }; d: { e: {}; f: {} } }`>,
    { a: { b: { c: number } }; d: { e: {}; f: {} } }
  >(),
]);

it("parses records", () => [
  eq<Parse<`{ a: Record<string, number> }`>, { a: Record<string, number> }>(),
  eq<
    Parse<`{ a: Record<string, { value: number }> }`>,
    { a: Record<string, { value: number }> }
  >(),
]);

it("parses records of records", () => [
  eq<
    Parse<`{ a: Record<string, Record<number, boolean>> }`>,
    { a: Record<string, Record<number, boolean>> }
  >(),
  eq<
    Parse<`{ a: Record<string, { a: Record<number, { b: boolean }>}> }`>,
    { a: Record<string, { a: Record<number, { b: boolean }> }> }
  >(),
]);

it("parses records of primitives with rules", () => [
  eq<
    Parse<`{ a: Record<string, string <email>>; b: string; }`>,
    { a: Record<string, string>; b: string }
  >(),
]);

it("parses records of objects with primitives with rules", () => [
  eq<
    Parse<`{ a: Record<string, { email: string <email> }>; b: string; }`>,
    { a: Record<string, { email: string }>; b: string }
  >(),
]);

it("parses N-dimensional arrays of primitives", () => [
  eq<Parse<`{ a: number[][] }`>, { a: number[][] }>(),
  eq<Parse<`{ a: number[][][][] }`>, { a: number[][][][] }>(),
]);

it("parses N-dimensional arrays of objects", () => [
  eq<Parse<`{ a: { a:string; }[][] }`>, { a: { a: string }[][] }>(),
  eq<Parse<`{ a: { a:string; }[][][][] }`>, { a: { a: string }[][][][] }>(),
]);

it("parses nested N-dimensional arrays", () => [
  eq<Parse<`{ a: { a:string; }[][] }`>, { a: { a: string }[][] }>(),
  eq<
    Parse<`{ a: { b:string = "Hello"; c: { d: number[][][] }[] }[][]; b: string[][]; }`>,
    { a: { b: string; c: { d: number[][][] }[] }[][]; b: string[][] }
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
  eq<Parse<`{{}[]}`>, CompileError<["Expected a key before '{}[]'"]>>(),
]);
