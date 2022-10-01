export interface PrimitiveNode {
  type: "primitive";
  valueType: "string" | "number";
  // Eventually, we will add rules here
}

export interface ArrayNode {
  type: "array";
  value: ValueNode;
}

export type ValueNode = PrimitiveNode | ArrayNode | ObjectNode;

export interface PropertyNode {
  type: "property";
  key: string;
  value: ValueNode;
}

export interface ObjectNode {
  type: "object";
  properties: PropertyNode[];
}

export type Ast = ObjectNode;
