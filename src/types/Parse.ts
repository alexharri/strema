import { CompileError } from "./CompileError";
import { StringJoin } from "./StringJoin";
import { Trim, TrimLeft } from "./Trim";
import { RemoveWhitespace } from "./Whitespace";

type Key = string | number | symbol;

type Resolve<T> = T extends CompileError<any>
  ? T
  : T extends any[]
  ? T extends any[][]
    ? // Is array of arrays -- resolve next level
      Resolve<T[number]>[]
    : T extends Record<Key, any>[]
    ? // Is array of objects -- resolve each object in array
      Array<{ [K in keyof T[number]]: Resolve<T[number][K]> }>
    : // Array of non-objects (primitives) -- no action needed
      T
  : // All non-array types end up here:
    //
    // For primitives, this does nothing:
    //
    //    string -> string
    //    number -> number
    //    ...
    //
    // For intersections, this "flattens" them:
    //
    //    { a: string } & { b: number } -> { a: string, b: number }
    //
    // Built-in objects (Functions, Sets, etc) are "flattened" and lose
    // information:
    //
    //    Set<any> -> { add: {}, clear: {}, delete: {} }
    //
    // Since this library only deals with JSON values, this behavior is OK.
    //
    // Unions are preserved for objects and primitives. However, arrays of
    // object unions lose information:
    //
    //    { a: string } | { b: number } -> { a: string } | { b: number }
    //    string | number -> string | number
    //    Array<string | number> -> Array<string | number>
    //    Array<{ a: string } | { b: number }> -> Array<{}>
    //
    // Since this library does not deal with unions, this behavior is OK.
    { [K in keyof T]: Resolve<T[K]> };

type MergeArrayIntoObject<T extends unknown[]> = T extends [infer R, ...infer U]
  ? R & MergeArrayIntoObject<U>
  : {};

type Tokens = ["string", "number"];
type Token = Tokens[number];

type TokenToValue = {
  string: string;
  number: number;
};

type ParseToken<T extends string> = T extends Token
  ? TokenToValue[T]
  : CompileError<
      [`Expected one of [${StringJoin<Tokens, ", ">}] but got '${T}'`]
    >;

type FindValue<T extends string> = T extends `Array<{${infer R}}>`
  ? _Parse<`{${R}}`>[]
  : T extends `{${infer R}}`
  ? _Parse<`{${R}}`>
  : T extends `${infer Token}[] ${string}`
  ? ParseToken<Token>[]
  : T extends `${infer Token} ${string}`
  ? ParseToken<Token>
  : ParseToken<T>;

type KeyValue<T extends string> = T extends `${infer K}:${infer Rest}`
  ? {
      key: K;
      value: FindValue<TrimLeft<Rest>> extends CompileError<infer E>
        ? CompileError<[`Failed to parse value of property '${K}'`, ...E]>
        : FindValue<TrimLeft<Rest>>;
    }
  : CompileError<[`Expected key-value property, got '${T}'`]>;

export type ParseProperty<T extends string> = KeyValue<T> extends {
  key: infer K;
  value: infer V;
}
  ? K extends string
    ? { [key in K]: V }
    : {}
  : KeyValue<T> extends CompileError<infer E>
  ? CompileError<E>
  : CompileError<[`Failed to parse property '${T}'`]>;

export type ParseProperties<T extends string[]> = T extends CompileError<
  infer E
>
  ? CompileError<E>
  : {
      [P in keyof T]: ParseProperty<Trim<T[P]>>;
    };

type RemoveEmptyStrings<T extends unknown[]> = T extends [
  infer R,
  ...infer Rest
]
  ? R extends string
    ? Trim<R> extends ""
      ? RemoveEmptyStrings<Rest>
      : [R, ...RemoveEmptyStrings<Rest>]
    : []
  : [];

type SplitIntoProperties<T extends string> =
  _SplitIntoProperties<T> extends CompileError<infer E>
    ? CompileError<E>
    : RemoveEmptyStrings<_SplitIntoProperties<T>>;

export type _SplitIntoProperties<T extends string> =
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

type StringWrapper<Left extends string, Right extends string> = {
  left: Left;
  right: Right;
};

type WrapString<
  T extends string,
  Wrap extends StringWrapper<string, string>
> = `${Wrap["left"]}${T}${Wrap["right"]}`;

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

type _Parse<T extends string> = T extends `{${infer Content}}`
  ? SplitIntoProperties<Content> extends infer AfterSplit
    ? AfterSplit extends CompileError<infer E>
      ? CompileError<E>
      : AfterSplit extends string[]
      ? MergeArrayIntoObject<ParseProperties<AfterSplit>>
      : CompileError<["Expected string[], got:", AfterSplit]>
    : never
  : CompileError<[`Expected {...}, got '${T}'`]>;

export type Parse<T extends string> = _Parse<
  RemoveWhitespace<T>
> extends CompileError<infer E>
  ? CompileError<E>
  : Resolve<_Parse<RemoveWhitespace<T>>>;
