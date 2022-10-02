export interface Schema<T> {
  readonly parseSync: (value: unknown) => T;
}
