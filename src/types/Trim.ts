/** Removes spaces and newlines on the left of a string */
export type TrimLeft<T extends string> = T extends ` ${infer R}`
  ? TrimLeft<R>
  : T extends `\n${infer R}`
  ? TrimLeft<R>
  : T;

/** Removes spaces and newlines on the right of a string */
export type TrimRight<T extends string> = T extends `${infer R} `
  ? TrimRight<R>
  : T extends `${infer R}\n`
  ? TrimRight<R>
  : T;

/** Removes spaces and newlines on both sides of a string */
export type Trim<T extends string> = TrimRight<TrimLeft<T>>;
