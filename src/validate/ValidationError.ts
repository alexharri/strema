import { ValidationContext } from "../types/ValidationContext";
import { stringifyPropertyPath } from "./utils/stringifyPropertyPath";

interface Options {
  message: string;
  value: unknown;
  ctx: ValidationContext;
}

export class ValidationError extends Error {
  value: unknown;
  path!: string;
  pathParts!: string[];

  constructor(options: Options) {
    super();

    this.name = "ValidationError";
    this.message = options.message;
    this.value = options.value;
    this.setPath(options.ctx.path);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  static empty() {
    return new ValidationError({ message: "", value: null, ctx: { path: [] } });
  }

  setPath(path: string[]) {
    this.path = stringifyPropertyPath(path);
    this.pathParts = path;
    return this;
  }
}
