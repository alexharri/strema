import { ValidationContext } from "../types/ValidationContext";

function stringifyPath(path: string[]) {
  return path.join(".");
}

interface Options {
  message: string;
  value: unknown;
  ctx: ValidationContext;
}

export class ValidationError extends Error {
  value: unknown;
  path: string;

  constructor(options: Options) {
    super();

    this.name = "ValidationError";
    this.message = options.message;
    this.value = options.value;
    this.path = stringifyPath(options.ctx.path);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
