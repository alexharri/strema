import { NumberRule } from "../types/Rule";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validateNumber(value: unknown, rules: NumberRule[], ctx: ValidationContext): ValidationError | null;
