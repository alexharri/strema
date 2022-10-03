import { CompileError as Err } from "./CompileError";
import { Resolve } from "./Resolve";
import { SplitIntoProperties } from "./SplitIntoProperties";
import { StringJoin } from "./StringJoin";
import { Trim, TrimLeft } from "./Trim";
import { RemoveWhitespace } from "./Whitespace";

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
  : Err<[`Expected one of [${StringJoin<Tokens, ", ">}] but got '${T}'`]>;

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

export type Parse<T extends string> = _Parse<RemoveWhitespace<T>> extends Err<
  infer E
>
  ? Err<E>
  : Resolve<_Parse<RemoveWhitespace<T>>>;
