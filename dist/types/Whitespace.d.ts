import { Trim } from "./Trim";
declare type RemoveSpaces<T extends string> = T extends `${infer L} ${infer R}` ? RemoveSpaces<`${L}${R}`> : T;
declare type RemoveTabs<T extends string> = T extends `${infer L}\t${infer R}` ? RemoveTabs<`${L}${R}`> : T;
declare type RemoveNewlines<T extends string> = T extends `${infer L}\n${infer R}` ? RemoveNewlines<`${L}${R}`> : T;
export declare type RemoveWhitespace<T extends string> = RemoveSpaces<RemoveTabs<RemoveNewlines<T>>>;
/**
 * Accepts a tuple of strings and returns a new tuple of strings with
 * whitespace-only strings removed.
 */
export declare type RemoveWhitespaceOnlyStringsFromTuple<T extends unknown[]> = T extends [infer R, ...infer Rest] ? R extends string ? Trim<R> extends "" ? RemoveWhitespaceOnlyStringsFromTuple<Rest> : [R, ...RemoveWhitespaceOnlyStringsFromTuple<Rest>] : [] : [];
export {};
