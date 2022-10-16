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

type Optional<T> = T extends Err<infer E> ? T : T | null;

type FindValue<T extends string> =
  // Array of objects
  T extends `Array<{${infer R}}>`
    ? _Parse<`{${R}}`>[]
    : T extends `{${infer R}}`
    ? _Parse<`{${R}}`>
    : //
    // Array of primitives (without rules)
    T extends `${infer Token}[]`
    ? ParseToken<Token>[]
    : //
    // Array of primitives (with rules)
    T extends `${infer Token}[]<${string}>`
    ? ParseToken<Token>[]
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
    ? Optional<ParseToken<Token>>
    : //
      // When none of the above matched, we expect to find just a primitive
      Optional<ParseToken<T>>;

type KeyValue<T extends string> = T extends `${infer K}:${infer Rest}`
  ? {
      key: K;
      value: FindValue<TrimLeft<Rest>> extends Err<infer E>
        ? Err<[`Failed to parse value of property '${K}'`, ...E]>
        : FindValue<TrimLeft<Rest>>;
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
  T extends `${infer Before}:string<${infer Rules}>="${infer _}"${infer After}`
    ? RemoveProblemCharactersInStringValues<`${Before}:string<${Rules}>=_${After}`>
    : T extends `${infer Before}:string="${infer _}"${infer After}`
    ? RemoveProblemCharactersInStringValues<`${Before}:string=_${After}`>
    : T;

type ResolveIfNotError<T> = T extends Err<infer E> ? Err<E> : Resolve<T>;

export type Parse<T extends string> = ResolveIfNotError<
  _Parse<RemoveProblemCharactersInStringValues<RemoveWhitespace<T>>>
>;
