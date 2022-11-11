/**
 * Joins a tuple of strings into a single string.
 *
 *    Input:
 *      StringJoin<["a", "b", "c"], ", ">
 *
 *    Resolves to:
 *      "a, b, c"
 */
export declare type StringJoin<T extends string[], Separator extends string = ""> = T extends [string, ...string[]] ? `${T[0]}${HasTail<T> extends true ? `${Separator}${StringJoin<Tail<T>, Separator>}` : ""}` : string[] extends T ? string : "";
declare type Tail<T extends string[]> = T extends [string, ...infer Rest] ? Rest extends string[] ? Rest : never : never;
/** Resolves to true if there are >=2 strings in the tuple */
declare type HasTail<T extends string[]> = T extends [string, string, ...string[]] ? true : false;
export {};
