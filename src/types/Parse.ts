import { CompileError as Err } from "./CompileError";
import { Primitive, PrimitivesTuple } from "./Primitive";
import { Resolve } from "./Resolve";
import { SplitIntoProperties } from "./SplitIntoProperties";
import { StringJoin } from "./StringJoin";
import { Trim, TrimLeft } from "./Trim";
import { RemoveWhitespace } from "./Whitespace";

type MergeArrayIntoObject<T extends unknown[]> = T extends [infer R, ...infer U]
  ? R & MergeArrayIntoObject<U>
  : {};

type TokenToValue = {
  string: string;
  number: number;
  boolean: boolean;
};

type ParseToken<T extends string> = T extends Primitive
  ? TokenToValue[T]
  : Err<
      [`Expected one of [${StringJoin<PrimitivesTuple, ", ">}] but got '${T}'`]
    >;

type MaybeOptional<T, Nullable extends boolean> = T extends Err<infer E>
  ? Err<E>
  : Nullable extends false
  ? T
  : T | null;

type ErrorIfOptional<T, Nullable extends boolean> = T extends Err<infer E>
  ? Err<E>
  : Nullable extends true
  ? Err<["Type cannot be optional", T]>
  : T;

type FindValue<T extends string, Nullable extends boolean> =
  // Record
  T extends `Record<${infer K extends "string" | "number"},${infer R}>`
    ? ErrorIfOptional<Record<TokenToValue[K], FindValue<R, false>>, Nullable>
    : //
    // Object primitive
    T extends `{${infer R}}`
    ? MaybeOptional<_Parse<`{${R}}`>, Nullable>
    : //
    // One of:
    //  1. Array of primitives without rules (such as `string[]`)
    //  2. Array of objects, Records, etc (such as `{...}[]` or `Record<>[]`)
    //
    // We handle N-dimensional arrays by recursively calling `FindValue`:
    //
    //    FindValue<`{}[][]`> -> FindValue<`{}[]`>[]
    //    FindValue<`{}[]`>[] -> FindValue<`{}`>[][]
    //    FindValue<`{}`>[][] -> {}[][]
    //
    T extends `${infer Before}[]`
    ? ErrorIfOptional<FindValue<Before, false>[], Nullable>
    : //
    // Array of primitives (with rules)
    T extends `${infer Token}[]<${string}>`
    ? MaybeOptional<FindValue<Token, false>[], Nullable>
    : //
    // Primitive with rules and a default
    T extends `${infer Token}<${string}>=${string}`
    ? ParseToken<Token>
    : //
    // Primitive with default
    T extends `${infer Token}=${string}`
    ? ParseToken<Token>
    : //
    // Primitive with rules
    T extends `${infer Token}<${string}>`
    ? MaybeOptional<ParseToken<Token>, Nullable>
    : //
      // When none of the above matched, we expect to find just a primitive
      MaybeOptional<ParseToken<T>, Nullable>;

type KeyValue<T extends string> = T extends `${infer _K}:${infer Rest}`
  ? _K extends `${infer K}?`
    ? {
        key: K;
        value: FindValue<TrimLeft<Rest>, true> extends Err<infer E>
          ? Err<[`Failed to parse value of property '${K}'`, ...E]>
          : FindValue<TrimLeft<Rest>, true>;
      }
    : {
        key: _K;
        value: FindValue<TrimLeft<Rest>, false> extends Err<infer E>
          ? Err<[`Failed to parse value of property '${_K}'`, ...E]>
          : FindValue<TrimLeft<Rest>, false>;
      }
  : Err<[`Expected key-value property, got '${T}'`]>;

export type ParseProperty<T extends string> = KeyValue<T> extends {
  key: infer K;
  value: infer V;
}
  ? K extends string
    ? { [key in K]: V }
    : {}
  : KeyValue<T> extends Err<infer E>
  ? Err<E>
  : Err<[`Failed to parse property '${T}'`]>;

export type ParseProperties<T extends string[]> = T extends Err<infer E>
  ? Err<E>
  : {
      [P in keyof T]: ParseProperty<Trim<T[P]>>;
    };

type _Parse<T extends string> = T extends `{${infer Content}}`
  ? SplitIntoProperties<Content> extends infer AfterSplit
    ? AfterSplit extends Err<infer E>
      ? Err<E>
      : AfterSplit extends string[]
      ? MergeArrayIntoObject<ParseProperties<AfterSplit>>
      : Err<["Expected string[], got:", AfterSplit]>
    : never
  : Err<[`Expected {...}, got '${T}'`]>;

type RemoveProblemCharactersInStringValues<T extends string> =
  T extends `${infer Before}\\"${infer After}`
    ? RemoveProblemCharactersInStringValues<`${Before}${After}`>
    : T extends `${infer Before}:string<${infer Rules}>="${infer _}"${infer After}`
    ? RemoveProblemCharactersInStringValues<`${Before}:string<${Rules}>=_${After}`>
    : T extends `${infer Before}:string="${infer _}"${infer After}`
    ? RemoveProblemCharactersInStringValues<`${Before}:string=_${After}`>
    : T;

type ResolveIfNotError<T> = T extends Err<infer E> ? Err<E> : Resolve<T>;

export type Parse<T extends string> = ResolveIfNotError<
  _Parse<RemoveProblemCharactersInStringValues<RemoveWhitespace<T>>>
>;
