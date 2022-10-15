import { Rule } from "./Rule";

export interface PrimitiveNode {
  type: "primitive";
  valueType: PrimitiveType;
  rules: Rule[];
}

export type PrimitiveType = "string" | "number" | "boolean";

export interface PropertyNode {
  type: "property";
  key: string;
  value: ValueNode;
}

export interface ObjectNode {
  type: "object";
  properties: PropertyNode[];
}

export interface ArrayNode {
  type: "array";
  value: ValueNode;
}

export type ValueNode = PrimitiveNode | ArrayNode | ObjectNode;

export type Ast = ObjectNode;
