// See https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type Eq<X, Y> = (<T>() => T extends X ? 0 : 1) extends <T>() => T extends Y
  ? 0
  : 1
  ? true
  : false;

export declare function it(name: string, callback: () => true[]): void;

export declare function eq<Type, Expect>(): Eq<Type, Expect>;
export declare function not_eq<Type, Expect>(): Eq<Type, Expect> extends true
  ? false
  : true;
