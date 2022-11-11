export declare type Equals<X, Y> = (<T>() => T extends X ? 0 : 1) extends <T>() => T extends Y ? 0 : 1 ? true : false;
