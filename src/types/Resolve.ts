import { CompileError } from "./CompileError";

type Key = string | number | symbol;

export type Resolve<T> = T extends CompileError<any>
  ? T
  : T extends any[]
  ? T extends any[][]
    ? // Is array of arrays -- resolve next level
      Resolve<T[number]>[]
    : T extends Record<Key, any>[]
    ? // Is array of objects -- resolve each object in array
      Array<{ [K in keyof T[number]]: Resolve<T[number][K]> }>
    : // Array of non-objects (primitives) -- no action needed
      T
  : // All non-array types end up here:
    //
    // For primitives, this does nothing:
    //
    //    string -> string
    //    number -> number
    //    ...
    //
    // For intersections, this "flattens" them:
    //
    //    { a: string } & { b: number } -> { a: string, b: number }
    //
    // Built-in objects (Functions, Sets, etc) are "flattened" and lose
    // information:
    //
    //    Set<any> -> { add: {}, clear: {}, delete: {} }
    //
    // Since this library only deals with JSON values, this behavior is OK.
    //
    // Unions are preserved for objects and primitives. However, arrays of
    // object unions lose information:
    //
    //    { a: string } | { b: number } -> { a: string } | { b: number }
    //    string | number -> string | number
    //    Array<string | number> -> Array<string | number>
    //    Array<{ a: string } | { b: number }> -> Array<{}>
    //
    // Since this library does not deal with unions, this behavior is OK.
    { [K in keyof T]: Resolve<T[K]> };
