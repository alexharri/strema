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
    SplitIntoProperties<`a:{b:{c:{}}}[];d:string;e:{}`>,
    [`a:Array<{b:{c:{}}}>`, `d:string`, `e:{}`]
  >(),
]);

/** @todo test error cases */
