import { PropertyNode, ValueNode } from "../../types/Ast";
import { ParserState } from "../state/ParserState";
export declare function parseArrayableValueAndRules(state: ParserState, { optional }: {
    optional: boolean;
}): ValueNode;
export declare function parseProperty(state: ParserState): PropertyNode;
export declare function parseProperties(state: ParserState): PropertyNode[];
