import { CompileError } from "./CompileError";
import { Equals } from "./Equals";
import { FilterString } from "./FilterString";
import { RemoveWhitespaceOnlyStringsFromTuple } from "./Whitespace";
import { StringWrapper, WrapString } from "./WrapString";

// When splitting properties, we cannot naively split by `;` because that would
// improperly split object properties.
//
//    Before: "a:string;b:{c:string;d:number};e:number;"
//
//    After: ["a:string", "b:{c:string", "d:number}", "e:number"]
//
// So when splitting, we attempt to split the string with the following
// pattern:
//
//    `${infer Before}{${infer InObject}}${infer After}`
//
// The literal `}` matching is greedy. It works fine for non-nested
// object properties. The input here:
//
//    `a:{b:string};c:number`
//
// Becomes:
//
//    Before:   `a:`
//    InObject: `b:string`
//    After:    `c:number`
//
// Which we then piece back together like so (simplified):
//
//    [`${Before}{${InObject}}`, ...Split<After>]
//
// But nested object properties get split up in a different manner.
//
//    Before: "a:{b:{c:{}}};d:string"
//
//    After: ["a:", b:{c:{", "}}", "d:string"]
//
// And piecing this together as before, results in the following:
//
//    ["a:{b:{c:{}", "}}", "d:string"]
//
// This type takes the closing braces ("}}") and joins them with the
// previous property, resulting in:
//
//    ["a:{b:{c:{};}}", "d:string"]
//
type JoinClosingBracesWithUnclosedObjectProperties<T extends string[]> =
  T extends [
    infer PrevProperty extends string,
    infer MaybeClosingBraces extends string,
    ...infer Rest extends string[]
  ]
    ? Equals<
        StringLength<FilterString<PrevProperty, "{">>,
        StringLength<FilterString<PrevProperty, "}">>
      > extends false
      ? JoinClosingBracesWithUnclosedObjectProperties<
          [`${PrevProperty};${MaybeClosingBraces}`, ...Rest]
        >
      : [
          PrevProperty,
          ...JoinClosingBracesWithUnclosedObjectProperties<
            [MaybeClosingBraces, ...Rest]
          >
        ]
    : T;

type StringAsTuple<T extends string> = T extends ""
  ? []
  : T extends `${infer C}${infer Rest}`
  ? [C, ...StringAsTuple<Rest>]
  : never;

type StringLength<T extends string> = StringAsTuple<T>["length"];

type OnMatchedObjectPropertyDuringSplit<
  Before extends string,
  InObject extends string,
  After extends string
> = OnMatchedWrappedProperty<Before, InObject, After, StringWrapper<"{", "}">>;

type OnMatchedRecordOfObjectsPropertyDuringSplit<
  Before extends string,
  InObject extends string,
  After extends string,
  K extends string
> = OnMatchedWrappedProperty<
  Before,
  InObject,
  After,
  StringWrapper<`Record<${K},{`, "}>">
>;

type OnMatchedArrayOfObjectsPropertyDuringSplit<
  Before extends string,
  InObject extends string,
  After extends string
> = OnMatchedWrappedProperty<
  Before,
  InObject,
  After,
  StringWrapper<"{", "}[]">
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
  // Attempt to match a Record of objects:
  //
  //    `a:Record<string,{b:string}>;c:number`
  //
  //    Before:   `a:`
  //    InObject: `b:string`
  //    After:    `c:number`
  //
  T extends `${infer Before}Record<${infer K extends
    | "string"
    | "number"},{${infer InObject}}>${infer After}` //
    ? OnMatchedRecordOfObjectsPropertyDuringSplit<Before, InObject, After, K>
    : //
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
    : JoinClosingBracesWithUnclosedObjectProperties<
        RemoveWhitespaceOnlyStringsFromTuple<_SplitIntoProperties<T>>
      >;
