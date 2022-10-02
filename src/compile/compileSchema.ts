import { astFromString } from "../ast/astFromString";
import { Parse } from "../types";
import { Schema } from "../types/Schema";

export function compileSchema<T extends string>(template: T): Schema<Parse<T>> {
  const ast = astFromString(template);

  const schema: Schema<Parse<T>> = {
    parseSync: (value) => {},
  };

  return schema;
}
