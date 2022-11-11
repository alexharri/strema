export interface CompileError<_Errors extends unknown[]> {
    /** If not included, `Eq<CompileError<["a"]>, CompileError<["b"]>>` returns  true */
    errors: _Errors;
    /**
     * By adding this property, we prevent `{}` being assigned to a `CompileError`.
     */
    readonly __never: never;
}
