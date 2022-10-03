import { CompileError } from "./CompileError";
import { RemoveWhitespaceStrings } from "./Whitespace";
import { StringWrapper, WrapString } from "./WrapString";

type OnMatchedObjectPropertyDuringSplit<
  Before extends string,
  InObject extends string,
  After extends string
> = OnMatchedWrappedProperty<Before, InObject, After, StringWrapper<"{", "}">>;

type OnMatchedArrayOfObjectsPropertyDuringSplit<
  Before extends string,
  InObject extends string,
  After extends string
> = OnMatchedWrappedProperty<
  Before,
  InObject,
  After,
  StringWrapper<"Array<{", "}>">
>;

type OnMatchedWrappedProperty<
  Before extends string,
  Content extends string,
  After extends string,
  Wrap extends StringWrapper<string, string>
> = _SplitIntoProperties<Before> extends [...infer R, infer Last]
  ? Last extends `${infer K}:`
    ? [
        ...R,
        `${K}:${WrapString<Content, Wrap>}`,
        ..._SplitIntoProperties<After>
      ]
    : CompileError<[`Expected key in format '<key>:', got '${Last & string}'`]>
  : CompileError<[`Expected a key before '${WrapString<Content, Wrap>}'`]>;

type _SplitIntoProperties<T extends string> =
  //
  // Attempt to match an array of objects (named Array syntax), for example:
  //
  //    `a:Array<{b:string}>;c:number`
  //
  //    Before:   `a:`
  //    InObject: `b:string`
  //    After:    `c:number`
  //
  T extends `${infer Before}Array<{${infer InObject}}>${infer After}` //
    ? OnMatchedArrayOfObjectsPropertyDuringSplit<Before, InObject, After>
    : //
    // Attempt to match an array of objects (literal array syntax), for example:
    //
    //    `a:{b:string}[];c:number`
    //
    //    Before:   `a:`
    //    InObject: `b:string`
    //    After:    `c:number`
    //
    T extends `${infer Before}{${infer InObject}}[]${infer After}`
    ? OnMatchedArrayOfObjectsPropertyDuringSplit<Before, InObject, After>
    : //
    // Attempt to match an object property, for example:
    //
    //    `a:{b:string};c:number`
    //
    // This gets split into:
    //
    //    Before:   `a:`
    //    InObject: `b:string`
    //    After:    `c:number`
    //
    T extends `${infer Before}{${infer InObject}}${infer After}`
    ? OnMatchedObjectPropertyDuringSplit<Before, InObject, After>
    : //
    // We did not match any array or object syntaxes:
    //
    //    `key:primitive[]`
    //    `key:Array<{...}>`
    //    `key:{...}[]`
    //
    // This means that we are only dealing with primitives in the form:
    //
    //    `key:primitive`
    //    `key:primitive;key:primitive`
    //    `key:primitive;key:primitive;...`
    //
    // So we can just split the string recursively at `;`
    T extends `${infer A};${infer B}`
    ? [A, ..._SplitIntoProperties<B>]
    : //
    // There are no more instances of `;` in the string. There is at
    // most one property so we can just return the string (if not empty).
    T extends ""
    ? []
    : [T];

export type SplitIntoProperties<T extends string> =
  _SplitIntoProperties<T> extends CompileError<infer E>
    ? CompileError<E>
    : RemoveWhitespaceStrings<_SplitIntoProperties<T>>;
