import { CompileError as Err } from "./CompileError";
import { Primitive, PrimitivesTuple } from "./Primitive";
import { Resolve } from "./Resolve";
import { SplitIntoProperties } from "./SplitIntoProperties";
import { StringJoin } from "./StringJoin";
import { Trim, TrimLeft } from "./Trim";
import { RemoveWhitespace } from "./Whitespace";
declare type MergeArrayIntoObject<T extends unknown[]> = T extends [infer R, ...infer U] ? R & MergeArrayIntoObject<U> : {};
declare type TokenToValue = {
    string: string;
    number: number;
    boolean: boolean;
};
declare type ParseToken<T extends string> = T extends Primitive ? TokenToValue[T] : Err<[
    `Expected one of [${StringJoin<PrimitivesTuple, ", ">}] but got '${T}'`
]>;
declare type MaybeOptional<T, Nullable extends boolean> = T extends Err<infer E> ? Err<E> : Nullable extends false ? T : T | null;
declare type ErrorIfOptional<T, Nullable extends boolean> = T extends Err<infer E> ? Err<E> : Nullable extends true ? Err<["Type cannot be optional", T]> : T;
declare type FindValue<T extends string, Nullable extends boolean> = T extends `Record<${infer K extends "string" | "number"},${infer R}>` ? ErrorIfOptional<Record<TokenToValue[K], FindValue<R, false>>, Nullable> : T extends `{${infer R}}` ? MaybeOptional<_Parse<`{${R}}`>, Nullable> : T extends `${infer Before}[]` ? MaybeOptional<FindValue<Before, false>[], Nullable> : T extends `${infer Token}[]<${string}>` ? MaybeOptional<FindValue<Token, false>[], Nullable> : T extends `${infer Token}<${string}>=${string}` ? ParseToken<Token> : T extends `${infer Token}=${string}` ? ParseToken<Token> : T extends `${infer Token}<${string}>` ? MaybeOptional<ParseToken<Token>, Nullable> : MaybeOptional<ParseToken<T>, Nullable>;
declare type KeyValue<T extends string> = T extends `${infer _K}:${infer Rest}` ? _K extends `${infer K}?` ? {
    key: K;
    value: FindValue<TrimLeft<Rest>, true> extends Err<infer E> ? Err<[`Failed to parse value of property '${K}'`, ...E]> : FindValue<TrimLeft<Rest>, true>;
} : {
    key: _K;
    value: FindValue<TrimLeft<Rest>, false> extends Err<infer E> ? Err<[`Failed to parse value of property '${_K}'`, ...E]> : FindValue<TrimLeft<Rest>, false>;
} : Err<[`Expected key-value property, got '${T}'`]>;
export declare type ParseProperty<T extends string> = KeyValue<T> extends {
    key: infer K;
    value: infer V;
} ? K extends string ? {
    [key in K]: V;
} : {} : KeyValue<T> extends Err<infer E> ? Err<E> : Err<[`Failed to parse property '${T}'`]>;
export declare type ParseProperties<T extends string[]> = T extends Err<infer E> ? Err<E> : {
    [P in keyof T]: ParseProperty<Trim<T[P]>>;
};
declare type _Parse<T extends string> = T extends `{${infer Content}}` ? SplitIntoProperties<Content> extends infer AfterSplit ? AfterSplit extends Err<infer E> ? Err<E> : AfterSplit extends string[] ? MergeArrayIntoObject<ParseProperties<AfterSplit>> : Err<["Expected string[], got:", AfterSplit]> : never : Err<[`Expected {...}, got '${T}'`]>;
declare type RemoveProblemCharactersInStringValues<T extends string> = T extends `${infer Before}\\"${infer After}` ? RemoveProblemCharactersInStringValues<`${Before}${After}`> : T extends `${infer Before}:string<${infer Rules}>="${infer _}"${infer After}` ? RemoveProblemCharactersInStringValues<`${Before}:string<${Rules}>=_${After}`> : T extends `${infer Before}:string="${infer _}"${infer After}` ? RemoveProblemCharactersInStringValues<`${Before}:string=_${After}`> : T;
declare type ResolveIfNotError<T> = T extends Err<infer E> ? Err<E> : Resolve<T>;
export declare type Parse<T extends string> = ResolveIfNotError<_Parse<RemoveProblemCharactersInStringValues<RemoveWhitespace<T>>>>;
export {};
