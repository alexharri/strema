export interface Schema<T> {
  parseSync: (value: unknown) => T;
}
