import { SplitIntoProperties } from "./SplitIntoProperties";
import { it, eq } from "./Test";

it("resolves to an empty array if the template is empty", () => [
  eq<SplitIntoProperties<``>, []>(),
]);

it("splits a template into properties", () => [
  eq<SplitIntoProperties<`a:string`>, ["a:string"]>(),
  eq<SplitIntoProperties<`a:string;`>, ["a:string"]>(),
  eq<SplitIntoProperties<`a:string;b:number`>, ["a:string", "b:number"]>(),
  eq<SplitIntoProperties<`a:string;b:number;`>, ["a:string", "b:number"]>(),
]);

it("tolerates unnecessary ';'", () => [
  eq<SplitIntoProperties<`;a:string`>, ["a:string"]>(),
  eq<SplitIntoProperties<`;a:string; ;`>, ["a:string"]>(),
]);

it("splits object properties", () => [
  eq<SplitIntoProperties<`a:string;b:{}`>, ["a:string", "b:{}"]>(),
  eq<SplitIntoProperties<`b:{};a:string;`>, ["b:{}", "a:string"]>(),
  eq<
    SplitIntoProperties<`a:string;b:{};c:number`>,
    ["a:string", "b:{}", "c:number"]
  >(),
]);

it("does not split the contents of an object property", () => [
  eq<
    SplitIntoProperties<`a:string;b:{c:string}`>,
    ["a:string", "b:{c:string}"]
  >(),
  eq<
    SplitIntoProperties<`a:string;b:{c:string};d:number`>,
    ["a:string", "b:{c:string}", "d:number"]
  >(),
]);

it("does not split properties if ';' is not used by a separator", () => [
  eq<SplitIntoProperties<`a:string b:number`>, ["a:string b:number"]>(),
  eq<SplitIntoProperties<`a:string,b:number`>, ["a:string,b:number"]>(),
  eq<SplitIntoProperties<`a:string\nb:number`>, ["a:string\nb:number"]>(),
]);

it("does not split nested object properties", () => [
  eq<
    SplitIntoProperties<`a:{b:{c:{}}};d:string;e:{}`>,
    [`a:{b:{c:{}}}`, `d:string`, `e:{}`]
  >(),
  eq<
    SplitIntoProperties<`a:{b:{c:{};d:{};e:{}}}`>,
    [`a:{b:{c:{};d:{};e:{}}}`]
  >(),
  eq<
    SplitIntoProperties<`a:{b:{c:{}}}[];d:string;e:{}`>,
    [`a:{b:{c:{}}}[]`, `d:string`, `e:{}`]
  >(),
]);

it("splits N-dimensional arrays of objects", () => [
  eq<SplitIntoProperties<`a:string;b:{}[][]`>, [`a:string`, `b:{}[][]`]>(),
  eq<SplitIntoProperties<`a:{}[][];b:string`>, [`a:{}[][]`, `b:string`]>(),
  eq<
    SplitIntoProperties<`a:{}[][];b:string;c:{}[][]`>,
    [`a:{}[][]`, `b:string`, `c:{}[][]`]
  >(),
  eq<
    SplitIntoProperties<`a:{}[];b:string[][];c:{}[][]`>,
    [`a:{}[]`, `b:string[][]`, `c:{}[][]`]
  >(),
]);

it("splits N-dimensional arrays of objects with object properties", () => [
  eq<SplitIntoProperties<`a:{b:{}[]}[];c:{}`>, ["a:{b:{}[]}[]", "c:{}"]>(),
  eq<
    SplitIntoProperties<`a:string;b:{c:{}[][]}[][];d:{}[][]`>,
    [`a:string`, `b:{c:{}[][]}[][]`, `d:{}[][]`]
  >(),
  eq<
    SplitIntoProperties<`a:string;b:{c:number[][]<int>}[][];g:{}[][]`>,
    [`a:string`, `b:{c:number[][]<int>}[][]`, `g:{}[][]`]
  >(),
  eq<
    SplitIntoProperties<`a:string;b:{c:{d:number[]<int>;e:{f:string[]<email>}[]}[]}[];g:{}[]`>,
    [
      `a:string`,
      `b:{c:{d:number[]<int>;e:{f:string[]<email>}[]}[]}[]`,
      `g:{}[]`
    ]
  >(),
]);

it("splits a record correctly", () => [
  eq<
    SplitIntoProperties<`a:Record<string,{b:number}>;c:number`>,
    [`a:Record<string,{b:number}>`, `c:number`]
  >(),
]);

it("splits a record of primitives with rules correctly", () => [
  eq<
    SplitIntoProperties<`a:Record<string,string<email>>;b:string;`>,
    ["a:Record<string,string<email>>", "b:string"]
  >(),
]);

/** @todo test error cases */
