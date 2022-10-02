import { ValidationContext } from "../types/ValidationContext";

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
    this.path = options.ctx.path.join(".");

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
