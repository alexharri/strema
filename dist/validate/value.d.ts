import { ValueNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
export declare function validateValue(value: unknown, valueSpec: ValueNode, ctx: ValidationContext): import("./ValidationError").ValidationError | undefined;
