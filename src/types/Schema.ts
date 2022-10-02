export interface Schema<T> {
  readonly parseSync: (value: unknown) => T;
  readonly __value: T;
}

export type SchemaValue<S extends Schema<any>> = S["__value"];
