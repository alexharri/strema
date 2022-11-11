import { NumberRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { ValidationError } from "../ValidationError";
export declare function validateNumberRule(ctx: ValidationContext, value: number, rule: NumberRule): ValidationError | null;
