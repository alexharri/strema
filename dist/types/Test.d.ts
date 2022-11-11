import { Equals } from "./Equals";
export declare function it(name: string, callback: () => true[]): void;
export declare function eq<Type, Expect>(): Equals<Type, Expect>;
export declare function not_eq<Type, Expect>(): Equals<Type, Expect> extends true ? false : true;
