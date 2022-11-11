import { Primitive } from "../../types/Primitive";
import { Rule } from "../../types/Rule";
import { ParserState } from "../state/ParserState";
export declare function parseRule(state: ParserState, primitiveType: Primitive): Rule;
export declare function parseRules(state: ParserState, primitiveType: Primitive): Rule[];
