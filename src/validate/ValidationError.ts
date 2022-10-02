interface Options {
  message: string;
  value: number;
  path: string;
}

export default class ValidationError extends Error {
  value: unknown;
  path: string;

  constructor(options: Options) {
    super();

    this.name = "ValidationError";
    this.message = options.message;
    this.value = options.value;
    this.path = options.path;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
