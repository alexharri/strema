import { typeAsString } from "../format/typeAsString";
import { enforceExhaustive } from "../switch";
import { ArrayNode, ObjectNode, RecordNode, ValueNode } from "../types/Ast";
import { isNullOrUndefined } from "../validate/utils/isNullOrUndefined";

function copyProperty(value: unknown, ast: ValueNode): unknown {
  const { type } = ast;
  switch (type) {
    case "primitive":
      if (isNullOrUndefined(value)) return ast.defaultValue;
      return value;
    case "object":
      return copyObject(value, ast);
    case "array":
      return copyArray(value as unknown[] | null, ast);
    case "record":
      return copyRecord(value || {}, ast);
    default:
      enforceExhaustive(type, "Unexpected type");
  }
}

function copyArray(array: unknown[] | null, ast: ArrayNode): unknown {
  if (!array) return null;
  return array.map((value) => copyProperty(value, ast.value));
}

/**
 * Assumes that the object has already been validated to match the AST.
 */
export function copyObject(object: unknown, ast: ObjectNode): unknown {
  if (isNullOrUndefined(object)) {
    if (ast.optional) return null;
    if (!ast.hasRequiredProperties) {
      object = {};
    } else {
      throw new Error(`Expected object, got '${typeAsString(object)}'`);
    }
  }

  const from = object as Record<string, unknown>;
  const to: Record<string, unknown> = {};

  for (const property of ast.properties) {
    to[property.key] = copyProperty(from[property.key], property.value);
  }

  return to;
}

export function copyRecord(record: unknown, ast: RecordNode): unknown {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record || {})) {
    if (isNullOrUndefined(value)) continue;

    out[key] = copyProperty(value, ast.value);
  }

  return out;
}
