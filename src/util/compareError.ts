import { ValidationError } from "../validate/ValidationError";

export function areValidationErrorsEqual(
  a: ValidationError,
  b: ValidationError
): boolean {
  for (const property of ["name", "message", "value", "path"] as const) {
    if (a[property] !== b[property]) return false;
  }
  return true;
}
