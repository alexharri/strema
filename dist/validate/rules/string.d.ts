import { StringRule } from "../../types/Rule";
import { ValidationContext } from "../../types/ValidationContext";
import { ValidationError } from "../ValidationError";
export declare function validateStringRule(ctx: ValidationContext, value: string, rule: StringRule): ValidationError | null;
