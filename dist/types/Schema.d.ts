export interface Schema<T> {
    readonly parseSync: (value: unknown) => T;
    readonly __valueType: T;
}
export declare type SchemaValue<S extends Schema<any>> = S["__valueType"];
