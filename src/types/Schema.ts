export interface Schema<T> {
  readonly parseSync: (value: T) => T;
  readonly __value: T;
}

export type SchemaValue<S extends Schema<any>> = S["__value"];
