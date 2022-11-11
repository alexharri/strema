import { RecordNode } from "../types/Ast";
import { ValidationContext } from "../types/ValidationContext";
import { ValidationError } from "./ValidationError";
export declare function validateRecord(record: unknown, spec: RecordNode, ctx: ValidationContext): ValidationError | null;
