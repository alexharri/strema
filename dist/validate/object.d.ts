import { ObjectNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validateObject(obj: unknown, spec: ObjectNode, ctx: ValidationContext): ValidationError | null;
