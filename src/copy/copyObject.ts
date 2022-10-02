import { enforceExhaustive } from "../switch";
import { ArrayNode, ObjectNode, ValueNode } from "../types/Ast";

function copyProperty(value: unknown, ast: ValueNode): unknown {
  const { type } = ast;
  switch (type) {
    case "primitive":
      return value;
    case "object":
      return copyObject(value, ast);
    case "array":
      return copyArray(value as unknown[], ast);
    default:
      enforceExhaustive(type, "Unexpected type");
  }
}

function copyArray(array: unknown[], ast: ArrayNode): unknown {
  return array.map((value) => copyProperty(value, ast.value));
}

/**
 * Assumes that the object has already been validated to match the AST.
 */
export function copyObject(object: unknown, ast: ObjectNode): unknown {
  const from = object as Record<string, unknown>;
  const to: Record<string, unknown> = {};

  for (const property of ast.properties) {
    to[property.key] = copyProperty(from[property.key], property.value);
  }

  return to;
}
