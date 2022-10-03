import { CompileError } from "./CompileError";
import { StringJoin } from "./StringJoin";
import { Trim, TrimLeft } from "./Trim";

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

export type ParseProperties<T extends string[]> = {
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

export type SplitIntoProperties<T extends string> =
  T extends `${infer A}Array<{${infer O}}>${infer B}`
    ? SplitIntoProperties<A> extends [...infer R, infer Last]
      ? Last extends `${infer K}: `
        ? [...R, `${K}:Array<{${O}}>`, ...SplitIntoProperties<B>]
        : never
      : never
    : T extends `${infer A}{${infer O}}[]${infer B}`
    ? SplitIntoProperties<A> extends [...infer R, infer Last]
      ? Last extends `${infer K}: `
        ? [...R, `${K}:Array<{${O}}>`, ...SplitIntoProperties<B>]
        : never
      : never
    : T extends `${infer A}{${infer O}}${infer B}`
    ? SplitIntoProperties<A> extends [...infer R, infer Last]
      ? Last extends `${infer K}: `
        ? [...R, `${K}:{${O}}`, ...SplitIntoProperties<B>]
        : never
      : never
    : T extends `${infer A};${infer B}`
    ? [A, ...SplitIntoProperties<B>]
    : [T];

type _Parse<T extends string> = T extends `{${infer R}}`
  ? ParseProperties<RemoveEmptyStrings<SplitIntoProperties<R>>> extends [
      ...infer U
    ]
    ? MergeArrayIntoObject<U>
    : never
  : CompileError<[`Expected {...}, got '${T}'`]>;

export type Parse<T extends string> = Resolve<_Parse<Trim<T>>>;
