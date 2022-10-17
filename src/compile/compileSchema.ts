import { astFromString } from "../ast/astFromString";
import { Parse } from "../types/Parse";
import { Schema } from "../types/Schema";
import { validateObject } from "../validate/object";
import { copyObject } from "../copy/copyObject";
import { typeAsString } from "../format/typeAsString";

export function compileSchema<T extends string>(template: T): Schema<Parse<T>> {
  const ast = astFromString(template);

  const schema: Schema<Parse<T>> = {
    parseSync: (value) => {
      if (typeof value !== "object" || !value) {
        throw new Error(`Expected object, got '${typeAsString(value)}'`);
      }

      const err = validateObject(value, ast.properties, { path: [] });
      if (err) {
        throw err;
      }
      return copyObject(value, ast) as Parse<T>;
    },
    __valueType: null!,
  };

  return schema;
}
