import { Primitive } from "./Primitive";
import { Rule } from "./Rule";

export interface PrimitiveNode {
  type: "primitive";
  valueType: Primitive;
  rules: Rule[];
  defaultValue: unknown;
}

export interface PropertyNode {
  type: "property";
  key: string;
  value: ValueNode;
}

export interface ObjectNode {
  type: "object";
  properties: PropertyNode[];
}

export interface RecordNode {
  type: "record";
  key: PrimitiveNode;
  value: ValueNode;
}

export interface ArrayNode {
  type: "array";
  value: ValueNode;
}

export type ValueNode = PrimitiveNode | ArrayNode | ObjectNode | RecordNode;

export type Ast = ObjectNode;
