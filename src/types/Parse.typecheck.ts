import { CompileError } from "./CompileError";
import { Parse, _SplitIntoProperties } from "./Parse";
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

it("parses objects as properties", () => [eq<Parse<`{ a: {} }`>, { a: {} }>()]);

it("parses arrays of objects as properties", () => [
  // Array literal syntax
  eq<Parse<`{ a: { b: number }[] }`>, { a: Array<{ b: number }> }>(),

  // Named array syntax
  eq<Parse<`{ a: Array<{ b: number }> }`>, { a: Array<{ b: number }> }>(),
]);

it("errors when an invalid symbol is provided for a property value", () => {
  type Err = [
    "Failed to parse value of property 'a'",
    "Expected one of [string, number] but got 'notvalid'"
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
