export interface CompileError<Errors extends string[]> {
  errors: Errors;
  /**
   * By adding this property, we prevent `{}` being assigned to it.
   */
  readonly __never: never;
}

export type ErrorsIn<E> = E extends CompileError<infer Errors> ? Errors : never;
