export interface PrimitiveNode {
  type: "primitive";
  valueType: "string" | "number";
  // Eventually, we will add rules here
}

export interface ArrayNode {
  type: "array";
  value: ValueNode;
}

type ValueNode = PrimitiveNode | ArrayNode | ObjectNode;

export interface PropertyNode {
  key: string;
  value: ValueNode;
}

export interface ObjectNode {
  type: "object";
  properties: PropertyNode[];
}

export type Ast = ObjectNode;
