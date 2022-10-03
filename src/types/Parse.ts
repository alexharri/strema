import { CompileError } from "./CompileError";
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
