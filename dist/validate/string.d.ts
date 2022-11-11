import { StringRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validateString(value: unknown, rules: StringRule[], ctx: ValidationContext): ValidationError | null;
