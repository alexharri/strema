import { ArrayNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validateArray(arr: unknown[], spec: ArrayNode, ctx: ValidationContext): ValidationError | null;
