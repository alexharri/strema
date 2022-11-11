import { CompileError } from "./CompileError";
declare type Key = string | number | symbol;
export declare type Resolve<T> = T extends CompileError<any> ? T : T extends any[] ? T extends any[][] ? Resolve<T[number]>[] : T extends Record<Key, any>[] ? Array<{
    [K in keyof T[number]]: Resolve<T[number][K]>;
}> : T : {
    [K in keyof T]: Resolve<T[K]>;
};
export {};
