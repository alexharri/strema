import { Parse } from "./types";
import { Schema } from "./types/Schema";

export function createSchema<T extends string>(): Schema<Parse<T>> {
  const schema: Schema<Parse<T>> = {
    parseSync: () => {
      throw new Error("Not implemented.");
    },
  };

  return schema;
}
