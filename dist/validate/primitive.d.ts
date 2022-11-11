import { PrimitiveNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validatePrimitive(value: unknown, spec: PrimitiveNode, ctx: ValidationContext): ValidationError | null;
