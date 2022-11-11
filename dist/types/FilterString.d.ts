declare type ExcludeFromTuple<T extends string[], E> = T extends [
    infer F extends string,
    ...infer R extends string[]
] ? [F] extends [E] ? ExcludeFromTuple<R, E> : [F, ...ExcludeFromTuple<R, E>] : [];
declare type StringToTuple<T extends string> = T extends "" ? [] : T extends `${infer C}${infer Rest}` ? [C, ...StringToTuple<Rest>] : never;
declare type TupleToString<T extends string[]> = T extends [
    infer R extends string,
    ...infer Rest extends string[]
] ? `${R}${TupleToString<Rest>}` : "";
export declare type FilterString<T extends string, FilterBy extends string> = TupleToString<ExcludeFromTuple<StringToTuple<T>, FilterBy>>;
export {};
