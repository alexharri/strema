import { Parse } from "../types/Parse";
import { Schema } from "../types/Schema";
export declare function compileSchema<T extends string>(template: T): Schema<Parse<T>>;
