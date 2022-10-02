import { astFromString } from "../ast/astFromString";
import { Parse } from "../types";
import { Schema } from "../types/Schema";
import { validateObject } from "../validate/object";
import { copyObject } from "../copy/copyObject";

export function compileSchema<T extends string>(template: T): Schema<Parse<T>> {
  const ast = astFromString(template);

  const schema: Schema<Parse<T>> = {
    parseSync: (value) => {
      const errorMessage = validateObject(value, ast.properties);
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      return copyObject(value, ast) as Parse<T>;
    },
  };

  return schema;
}
