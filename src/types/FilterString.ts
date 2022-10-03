export type FilterString<
  T extends string,
  FilterBy extends string
> = T extends `${infer R extends FilterBy}${infer After}`
  ? `${R}${FilterString<After, FilterBy>}`
  : T extends `${string}${infer R extends FilterBy}${infer After}`
  ? `${R}${FilterString<After, FilterBy>}`
  : "";
