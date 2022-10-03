export interface CompileError<_Errors extends string[]> {
  /**
   * By adding this property, we prevent `{}` being assigned to a `CompileError`.
   */
  readonly __never: never;
}
