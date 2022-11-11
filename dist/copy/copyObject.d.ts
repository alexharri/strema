import { ObjectNode, RecordNode } from "../types/Ast";
/**
 * Assumes that the object has already been validated to match the AST.
 */
export declare function copyObject(object: unknown, ast: ObjectNode): unknown;
export declare function copyRecord(record: unknown, ast: RecordNode): unknown;
