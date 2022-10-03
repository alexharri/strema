type RemoveSpaces<T extends string> = T extends `${infer L} ${infer R}`
  ? RemoveSpaces<`${L}${R}`>
  : T;

type RemoveTabs<T extends string> = T extends `${infer L}\t${infer R}`
  ? RemoveTabs<`${L}${R}`>
  : T;

type RemoveNewlines<T extends string> = T extends `${infer L}\n${infer R}`
  ? RemoveNewlines<`${L}${R}`>
  : T;

export type RemoveWhitespace<T extends string> = RemoveSpaces<
  RemoveTabs<RemoveNewlines<T>>
>;
