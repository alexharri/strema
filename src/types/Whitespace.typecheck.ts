import { RemoveWhitespace } from "./Whitespace";
import { it, eq } from "./Test";

it("removes newlines at the start and end of strings", () => [
  eq<RemoveWhitespace<"\nhello\n">, "hello">(),
  eq<RemoveWhitespace<"hello\n">, "hello">(),
  eq<RemoveWhitespace<"\n\nhello\n\n">, "hello">(),
]);

it("removes newlines in the middle of strings", () => [
  eq<RemoveWhitespace<"hello\nworld">, "helloworld">(),
  eq<RemoveWhitespace<"hello\n\n\nworld">, "helloworld">(),
]);

it("removes spaces at the start and end of strings", () => [
  eq<RemoveWhitespace<" hello ">, "hello">(),
  eq<RemoveWhitespace<"hello ">, "hello">(),
  eq<RemoveWhitespace<"  hello  ">, "hello">(),
]);

it("removes spaces in the middle of strings", () => [
  eq<RemoveWhitespace<"hello world">, "helloworld">(),
  eq<RemoveWhitespace<"hello   world">, "helloworld">(),
]);

it("removes newlines at the start and end of strings", () => [
  eq<RemoveWhitespace<"\thello\t">, "hello">(),
  eq<RemoveWhitespace<"hello\t">, "hello">(),
  eq<RemoveWhitespace<"\t\thello\t\t">, "hello">(),
]);

it("removes newlines in the middle of strings", () => [
  eq<RemoveWhitespace<"hello\tworld">, "helloworld">(),
  eq<RemoveWhitespace<"hello\t\t\tworld">, "helloworld">(),
]);

it("removes all whitespace", () => [
  eq<
    RemoveWhitespace<`{
    key:\tvalue;
  }`>,
    `{key:value;}`
  >(),
]);
