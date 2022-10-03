export type StringWrapper<Left extends string, Right extends string> = {
  left: Left;
  right: Right;
};

export type WrapString<
  T extends string,
  Wrap extends StringWrapper<string, string>
> = `${Wrap["left"]}${T}${Wrap["right"]}`;
